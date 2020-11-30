import createRollupResolve, { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import path from 'path';
import fs from 'fs';
import whatwgUrl from 'whatwg-url';
import { Plugin } from '../Plugin';
import { toBrowserPath } from '../utils/utils';

function readPkgJson(pkg: string) {
  const nodeResolvePath = require.resolve(pkg);
  const pkgName = path.join('node_modules', pkg);
  const lastPkgDir = nodeResolvePath.lastIndexOf(pkgName);
  const pathToPkgDir = nodeResolvePath.substring(0, lastPkgDir);
  const pkgDir = path.join(pathToPkgDir, pkgName);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    return undefined;
  }

  const pkgJsonString = fs.readFileSync(pkgJsonPath, 'utf-8');
  return JSON.parse(pkgJsonString);
}

const nodeResolvePackageJson = readPkgJson('@rollup/plugin-node-resolve');

const fakePluginContext = {
  meta: {
    rollupVersion: nodeResolvePackageJson.peerDependencies.rollup,
  },
  warn(...msg: string[]) {
    console.warn('[es-dev-server] node-resolve: ', ...msg);
  },
};

interface NodeResolveConfig {
  rootDir: string;
  fileExtensions: string[];
  nodeResolve: boolean | RollupNodeResolveOptions;
}

export function nodeResolvePlugin(config: NodeResolveConfig): Plugin {
  const { fileExtensions, rootDir } = config;
  const userOptions = typeof config.nodeResolve === 'object' ? config.nodeResolve : {};
  const customResolveOptions: any = (userOptions as any)?.customResolveOptions ?? {};
  const options = {
    rootDir,
    // allow resolving polyfills for nodejs libs
    preferBuiltins: false,
    extensions: fileExtensions,
    ...userOptions,
    customResolveOptions: undefined,
    moduleDirectories: customResolveOptions?.moduleDirectory,
  };
  const preserveSymlinks = !!customResolveOptions?.preserveSymlinks;
  const nodeResolve = createRollupResolve(options);

  // call buildStart
  nodeResolve.buildStart?.call(fakePluginContext as any, { preserveSymlinks });

  return {
    async serverStart({ config }) {},

    async resolveImport({ source, context }) {
      if (!path.isAbsolute(source) && whatwgUrl.parseURL(source) != null) {
        // don't resolve relative and valid urls
        return source;
      }
      const [withoutHash, hash] = source.split('#');
      const [importPath, params] = withoutHash.split('?');

      const relativeImport = importPath.startsWith('.') || importPath.startsWith('/');
      const jsFileImport = fileExtensions.includes(path.extname(importPath));
      // for performance, don't resolve relative imports of js files. we only do this for js files,
      // because an import like ./foo/bar.css might actually need to resolve to ./foo/bar.css.js
      if (relativeImport && jsFileImport) {
        return source;
      }

      const requestedFile = context.path.endsWith('/') ? `${context.path}index.html` : context.path;
      const filePath = path.join(rootDir, requestedFile);

      // do the actual resolve using the rolluo plugin
      const result = await nodeResolve.resolveId?.call(
        fakePluginContext as any,
        importPath,
        filePath,
      );
      let resolvedImportFilePath;

      if (result) {
        if (typeof result === 'string') {
          resolvedImportFilePath = result;
        } else if (typeof result.id === 'string') {
          resolvedImportFilePath = result.id;
        }
      }

      if (!resolvedImportFilePath) {
        throw new Error(
          `Could not resolve import "${importPath}" in "${path.relative(
            process.cwd(),
            filePath,
          )}".`,
        );
      }

      const resolveRelativeTo = path.extname(filePath) ? path.dirname(filePath) : filePath;
      const relativeImportFilePath = path.relative(resolveRelativeTo, resolvedImportFilePath);
      const suffix = `${params ? `?${params}` : ''}${hash ? `#${hash}` : ''}`;
      const resolvedImportPath = `${toBrowserPath(relativeImportFilePath)}${suffix}`;
      return resolvedImportPath.startsWith('/') || resolvedImportPath.startsWith('.')
        ? resolvedImportPath
        : `./${resolvedImportPath}`;
    },
  };
}

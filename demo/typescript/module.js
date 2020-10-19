"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var lit_html_1 = require("lit-html");
var lit_element_1 = require("lit-element");
function getMessage() {
    var message = 'A web component written in typescript compiles correctly';
    return message;
}
var MyElement = /** @class */ (function (_super) {
    __extends(MyElement, _super);
    function MyElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.message = 'world';
        return _this;
    }
    MyElement.prototype.render = function () {
        return lit_html_1.html(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      Hello ", "\n    "], ["\n      Hello ", "\n    "])), this.message);
    };
    __decorate([
        lit_element_1.property({ type: String })
    ], MyElement.prototype, "message");
    MyElement = __decorate([
        lit_element_1.customElement('my-element')
    ], MyElement);
    return MyElement;
}(lit_element_1.LitElement));
var myElement = document.createElement('my-element');
window.__litElement = (myElement.message === 'world' &&
    myElement.render() instanceof lit_element_1.TemplateResult &&
    getMessage() === 'A web component written in typescript compiles correctly');
var templateObject_1;

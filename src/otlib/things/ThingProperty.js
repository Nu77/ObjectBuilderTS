"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ThingProperty = void 0;
class ThingProperty {
    constructor() {
        this.property = "";
        this.value = null;
    }
    toString() {
        return `[ThingProperty property=${this.property}, value=${this.value}]`;
    }
}
exports.ThingProperty = ThingProperty;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteDimension = void 0;
class SpriteDimension {
    constructor() {
        this.value = "";
        this.size = 0;
        this.dataSize = 0;
    }
    toString() {
        return this.value;
    }
    serialize() {
        return {
            value: this.value,
            size: this.size,
            dataSize: this.dataSize
        };
    }
    unserialize(xml) {
        if (!xml) {
            throw new Error("xml cannot be null");
        }
        if (xml.value === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'value' attribute.");
        }
        if (xml.size === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'size' attribute.");
        }
        if (xml.dataSize === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'dataSize' attribute.");
        }
        this.value = String(xml.value);
        this.size = parseInt(xml.size, 10);
        this.dataSize = parseInt(xml.dataSize, 10);
    }
}
exports.SpriteDimension = SpriteDimension;

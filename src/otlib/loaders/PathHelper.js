"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PathHelper = void 0;
class PathHelper {
    constructor(nativePath = null, id = 0) {
        this.id = 0;
        this.nativePath = "";
        this.id = id;
        this.nativePath = nativePath || "";
    }
    toString() {
        return `[object PathHelper id=${this.id}, nativePath=${this.nativePath}]`;
    }
}
exports.PathHelper = PathHelper;

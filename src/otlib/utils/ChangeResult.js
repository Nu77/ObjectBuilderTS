"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeResult = void 0;
class ChangeResult {
    constructor(list = null, done = false, message = "") {
        this.list = null;
        this.done = false;
        this.message = "";
        this.list = list;
        this.done = done;
        this.message = message || "";
    }
    update(list = null, done = false, message = "") {
        this.list = list;
        this.done = done;
        this.message = message || "";
        return this;
    }
}
exports.ChangeResult = ChangeResult;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressEvent = void 0;
const events_1 = require("events");
class ProgressEvent extends events_1.EventEmitter {
    constructor(type = ProgressEvent.PROGRESS, id = "", loaded = 0, total = 0, label = "") {
        super();
        this.id = "";
        this.loaded = 0;
        this.total = 0;
        this.label = "";
        this.type = ProgressEvent.PROGRESS;
        this.type = type;
        this.id = id;
        this.loaded = loaded;
        this.total = total;
        this.label = label;
    }
    clone() {
        return new ProgressEvent(this.type, this.id, this.loaded, this.total, this.label);
    }
}
exports.ProgressEvent = ProgressEvent;
ProgressEvent.PROGRESS = "progress";

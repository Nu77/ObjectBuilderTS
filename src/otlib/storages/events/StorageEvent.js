"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageEvent = void 0;
const events_1 = require("events");
class StorageEvent extends events_1.EventEmitter {
    constructor(type, bubbles = false, cancelable = false, changedIds = null, category = null) {
        super();
        this.changedIds = null;
        this.category = null;
        this.bubbles = false;
        this.cancelable = false;
        this.target = null;
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.changedIds = changedIds;
        this.category = category;
    }
    clone() {
        return new StorageEvent(this.type, this.bubbles, this.cancelable, this.changedIds, this.category);
    }
}
exports.StorageEvent = StorageEvent;
StorageEvent.LOAD = "load";
StorageEvent.CHANGE = "change";
StorageEvent.COMPILE = "compile";
StorageEvent.UNLOADING = "unloading";
StorageEvent.UNLOAD = "unload";

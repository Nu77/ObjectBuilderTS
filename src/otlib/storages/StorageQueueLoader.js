"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageQueueLoader = void 0;
const events_1 = require("events");
const StorageEvent_1 = require("./events/StorageEvent");
class StorageQueueLoader extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._storages = [];
        this._index = -1;
        this._running = false;
        this._loaded = false;
    }
    get running() { return this._running; }
    get loaded() { return this._loaded; }
    add(storage, callback, ...args) {
        if (!storage) {
            throw new Error("storage cannot be null");
        }
        // Check if already added
        for (let i = this._storages.length - 1; i >= 0; i--) {
            if (this._storages[i].callback === callback) {
                return;
            }
        }
        this.addHandlers(storage);
        this._storages.push({ storage, callback, args });
    }
    start() {
        if (this._running) {
            return;
        }
        this._index = -1;
        this._running = true;
        this._loaded = false;
        this.loadNext();
    }
    addHandlers(storage) {
        storage.on(StorageEvent_1.StorageEvent.LOAD, this.storageHandler.bind(this));
    }
    removeHandlers(storage) {
        storage.removeListener(StorageEvent_1.StorageEvent.LOAD, this.storageHandler.bind(this));
    }
    loadNext() {
        this._index++;
        if (this._index >= this._storages.length) {
            this._running = false;
            this._loaded = true;
            this.emit("complete");
        }
        else {
            const data = this._storages[this._index];
            data.callback.apply(data.storage, data.args);
        }
    }
    storageHandler(event) {
        const storage = event.target;
        this.removeHandlers(storage);
        this.loadNext();
    }
}
exports.StorageQueueLoader = StorageQueueLoader;

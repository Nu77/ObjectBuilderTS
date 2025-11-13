import { EventEmitter } from "events";
import { IStorage } from "./IStorage";
import { StorageEvent } from "./events/StorageEvent";

interface StorageData {
    storage: IStorage;
    callback: (...args: any[]) => void;
    args: any[];
}

export class StorageQueueLoader extends EventEmitter {
    private _storages: StorageData[] = [];
    private _index: number = -1;
    private _running: boolean = false;
    private _loaded: boolean = false;

    public get running(): boolean { return this._running; }
    public get loaded(): boolean { return this._loaded; }

    public add(storage: IStorage, callback: (...args: any[]) => void, ...args: any[]): void {
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

    public start(): void {
        if (this._running) {
            return;
        }

        this._index = -1;
        this._running = true;
        this._loaded = false;

        this.loadNext();
    }

    protected addHandlers(storage: IStorage): void {
        storage.on(StorageEvent.LOAD, this.storageHandler.bind(this));
    }

    protected removeHandlers(storage: IStorage): void {
        storage.removeListener(StorageEvent.LOAD, this.storageHandler.bind(this));
    }

    private loadNext(): void {
        this._index++;
        if (this._index >= this._storages.length) {
            this._running = false;
            this._loaded = true;
            this.emit("complete");
        } else {
            const data = this._storages[this._index];
            data.callback.apply(data.storage, data.args);
        }
    }

    private storageHandler(event: StorageEvent): void {
        const storage = event.target as IStorage;
        this.removeHandlers(storage);
        this.loadNext();
    }
}


/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

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


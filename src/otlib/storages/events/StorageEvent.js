"use strict";
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

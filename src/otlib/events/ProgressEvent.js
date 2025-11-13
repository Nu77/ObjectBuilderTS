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

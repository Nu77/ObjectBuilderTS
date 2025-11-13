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

export class StorageEvent extends EventEmitter {
    public static readonly LOAD: string = "load";
    public static readonly CHANGE: string = "change";
    public static readonly COMPILE: string = "compile";
    public static readonly UNLOADING: string = "unloading";
    public static readonly UNLOAD: string = "unload";

    public changedIds: number[] | null = null;
    public category: string | null = null;
    public type: string;
    public bubbles: boolean = false;
    public cancelable: boolean = false;
    public target: any = null;

    constructor(type: string,
                bubbles: boolean = false,
                cancelable: boolean = false,
                changedIds: number[] | null = null,
                category: string | null = null) {
        super();
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.changedIds = changedIds;
        this.category = category;
    }

    public clone(): StorageEvent {
        return new StorageEvent(this.type, this.bubbles, this.cancelable, this.changedIds, this.category);
    }
}


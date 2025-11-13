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
exports.ThingListItem = void 0;
const BitmapData_1 = require("./BitmapData");
const SpriteExtent_1 = require("./SpriteExtent");
class ThingListItem {
    get id() { return this.thing ? this.thing.id : 0; }
    constructor() {
        this.thing = null;
        this.frameGroup = null;
        this.pixels = null;
        this._bitmap = null;
    }
    getBitmap(backgroundColor = 0x00000000) {
        if (this.pixels && this.thing && this.frameGroup && !this._bitmap) {
            this.pixels.position = 0;
            const width = Math.max(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, this.frameGroup.width * SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
            const height = Math.max(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, this.frameGroup.height * SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
            this._bitmap = new BitmapData_1.BitmapData(width, height, true, backgroundColor);
            if (this.frameGroup.width !== 0 &&
                this.frameGroup.height !== 0 &&
                this.pixels.length === (this._bitmap.width * this._bitmap.height * 4)) {
                this._bitmap.setPixels(this._bitmap.rect, this.pixels.toBuffer());
            }
        }
        return this._bitmap;
    }
}
exports.ThingListItem = ThingListItem;

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
exports.SpriteData = void 0;
const BitmapData_1 = require("../utils/BitmapData");
const Rect_1 = require("../geom/Rect");
const SpriteUtils_1 = require("../utils/SpriteUtils");
const SpriteExtent_1 = require("../utils/SpriteExtent");
class SpriteData {
    get id() { return this._id; }
    set id(value) { this._id = value; }
    get pixels() { return this._pixels; }
    set pixels(value) { this._pixels = value; }
    constructor() {
        this._id = 0;
        this._pixels = null;
        this._rect = new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
        this._bitmapData = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
    }
    toString() {
        return `[object SpriteData id=${this.id}]`;
    }
    /**
     * @param backgroundColor A 32-bit ARGB color value.
     */
    getBitmap(backgroundColor = 0x00000000) {
        if (this.pixels) {
            try {
                this._bitmapData.setPixels(this._rect, this.pixels);
                const bitmap = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true, backgroundColor);
                bitmap.copyPixels(this._bitmapData, this._rect, { x: 0, y: 0 }, null, null, true);
                return bitmap;
            }
            catch (error) {
                return null;
            }
        }
        return null;
    }
    isEmpty() {
        if (this.pixels) {
            this._bitmapData.setPixels(this._rect, this.pixels);
            return SpriteUtils_1.SpriteUtils.isEmpty(this._bitmapData);
        }
        return true;
    }
    clone() {
        let pixelsCopy = null;
        if (this._pixels) {
            pixelsCopy = Buffer.from(this._pixels);
        }
        const sd = new SpriteData();
        sd.id = this._id;
        sd.pixels = pixelsCopy;
        return sd;
    }
    static createSpriteData(id = 0, pixels = null) {
        const data = new SpriteData();
        data.id = id;
        const bitmapData = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
        data.pixels = pixels ? pixels : bitmapData.getPixels(new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE));
        return data;
    }
}
exports.SpriteData = SpriteData;

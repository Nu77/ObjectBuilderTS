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

import { BitmapData } from "../utils/BitmapData";
import { Rect } from "../geom/Rect";
import { IListObject } from "../components/IListObject";
import { SpriteUtils } from "../utils/SpriteUtils";
import { SpriteExtent } from "../utils/SpriteExtent";

export class SpriteData implements IListObject {
    private _id: number = 0;
    private _pixels: Buffer | null = null;
    private _rect: Rect;
    private _bitmapData: BitmapData;

    public get id(): number { return this._id; }
    public set id(value: number) { this._id = value; }
    
    public get pixels(): Buffer | null { return this._pixels; }
    public set pixels(value: Buffer | null) { this._pixels = value; }

    constructor() {
        this._rect = new Rect(0, 0, SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE);
        this._bitmapData = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
    }

    public toString(): string {
        return `[object SpriteData id=${this.id}]`;
    }

    /**
     * @param backgroundColor A 32-bit ARGB color value.
     */
    public getBitmap(backgroundColor: number = 0x00000000): BitmapData | null {
        if (this.pixels) {
            try {
                this._bitmapData.setPixels(this._rect, this.pixels);
                const bitmap = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, true, backgroundColor);
                bitmap.copyPixels(this._bitmapData, this._rect, { x: 0, y: 0 }, null, null, true);
                return bitmap;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    public isEmpty(): boolean {
        if (this.pixels) {
            this._bitmapData.setPixels(this._rect, this.pixels);
            return SpriteUtils.isEmpty(this._bitmapData);
        }
        return true;
    }

    public clone(): SpriteData {
        let pixelsCopy: Buffer | null = null;

        if (this._pixels) {
            pixelsCopy = Buffer.from(this._pixels);
        }

        const sd = new SpriteData();
        sd.id = this._id;
        sd.pixels = pixelsCopy;
        return sd;
    }

    public static createSpriteData(id: number = 0, pixels: Buffer | null = null): SpriteData {
        const data = new SpriteData();
        data.id = id;

        const bitmapData = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
        data.pixels = pixels ? pixels : bitmapData.getPixels(new Rect(0, 0, SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE));

        return data;
    }
}


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

import { ThingType } from "../things/ThingType";
import { FrameGroup } from "../animation/FrameGroup";
import { ByteArray } from "./ByteArray";
import { BitmapData } from "./BitmapData";
import { SpriteExtent } from "./SpriteExtent";
import { IListObject } from "../components/IListObject";

export class ThingListItem implements IListObject {
    public thing: ThingType | null = null;
    public frameGroup: FrameGroup | null = null;
    public pixels: ByteArray | null = null;

    private _bitmap: BitmapData | null = null;

    public get id(): number { return this.thing ? this.thing.id : 0; }

    constructor() {
    }

    public getBitmap(backgroundColor: number = 0x00000000): BitmapData | null {
        if (this.pixels && this.thing && this.frameGroup && !this._bitmap) {
            this.pixels.position = 0;
            const width = Math.max(SpriteExtent.DEFAULT_SIZE, this.frameGroup.width * SpriteExtent.DEFAULT_SIZE);
            const height = Math.max(SpriteExtent.DEFAULT_SIZE, this.frameGroup.height * SpriteExtent.DEFAULT_SIZE);
            this._bitmap = new BitmapData(width, height, true, backgroundColor);
            
            if (this.frameGroup.width !== 0 &&
                this.frameGroup.height !== 0 &&
                this.pixels.length === (this._bitmap.width * this._bitmap.height * 4)) {
                this._bitmap.setPixels(this._bitmap.rect, this.pixels.toBuffer());
            }
        }
        return this._bitmap;
    }
}


"use strict";

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

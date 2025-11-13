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


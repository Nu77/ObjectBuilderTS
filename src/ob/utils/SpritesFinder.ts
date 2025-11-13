import { EventEmitter } from "events";
import { ThingTypeStorage } from "../../otlib/things/ThingTypeStorage";
import { SpriteStorage } from "../../otlib/sprites/SpriteStorage";
import { ThingType } from "../../otlib/things/ThingType";
import { FrameGroup } from "../../otlib/animation/FrameGroup";
import { FrameGroupType } from "../../otlib/things/FrameGroupType";
import { SpriteData } from "../../otlib/sprites/SpriteData";
import { ProgressEvent } from "../../otlib/events/ProgressEvent";
import { ProgressBarID } from "../commands/ProgressBarID";

export class SpritesFinder extends EventEmitter {
    private _dat: ThingTypeStorage;
    private _spr: SpriteStorage;
    private _foundList: SpriteData[] = [];
    private _finished: boolean = false;

    public get foundList(): SpriteData[] {
        return this._foundList;
    }

    constructor(dat: ThingTypeStorage, spr: SpriteStorage) {
        super();

        if (!dat) {
            throw new Error("dat cannot be null");
        }

        if (!spr) {
            throw new Error("spr cannot be null");
        }

        this._dat = dat;
        this._spr = spr;
    }

    public start(unusedSprites: boolean, emptySprites: boolean): void {
        if (this._finished) return;

        if (unusedSprites || emptySprites) {
            const length = this._spr.spritesCount + 1;
            let i = 0;
            const spriteFoundList: SpriteData[] = [];
            const usedList: boolean[] = new Array(length).fill(false);

            if (unusedSprites) {
                // Scan items
                this.scanList(this._dat.items, usedList);

                // Scan outfits
                this.scanList(this._dat.outfits, usedList);

                // Scan effects
                this.scanList(this._dat.effects, usedList);

                // Scan missiles
                this.scanList(this._dat.missiles, usedList);

                // Get all unused/empty sprites
                for (i = 1; i < length; i++) {
                    if (!usedList[i] && (!this._spr.isEmptySprite(i) || emptySprites)) {
                        const spriteData = new SpriteData();
                        spriteData.id = i;
                        const pixels = this._spr.getPixels(i);
                        if (pixels) {
                            spriteData.pixels = pixels;
                            spriteFoundList.push(spriteData);

                            if (i % 10 === 0) {
                                this.dispatchProgress(i, length);
                            }
                        }
                    }
                }
            } else {
                // Get all empty sprites
                for (i = 1; i < length; i++) {
                    if (this._spr.isEmptySprite(i)) {
                        const spriteData = new SpriteData();
                        spriteData.id = i;
                        const pixels = this._spr.getPixels(i);
                        if (pixels) {
                            spriteData.pixels = pixels;
                            spriteFoundList.push(spriteData);

                            if (i % 10 === 0) {
                                this.dispatchProgress(i, length);
                            }
                        }
                    }
                }
            }

            this._foundList = spriteFoundList;
        }

        this._finished = true;
        this.emit("complete");
    }

    private scanList(list: Map<number, ThingType>, usedList: boolean[]): void {
        for (const thing of list.values()) {
            for (let groupType = FrameGroupType.DEFAULT; groupType <= FrameGroupType.WALKING; groupType++) {
                const frameGroup = thing.getFrameGroup(groupType);
                if (!frameGroup) {
                    continue;
                }

                const spriteIDs = frameGroup.spriteIndex;
                if (!spriteIDs) {
                    continue;
                }

                const length = spriteIDs.length;
                for (let i = 0; i < length; i++) {
                    const spriteId = spriteIDs[i];
                    if (spriteId < usedList.length) {
                        usedList[spriteId] = true;
                    }
                }
            }
        }
    }

    private dispatchProgress(current: number, target: number): void {
        this.emit("progress", new ProgressEvent(
            ProgressEvent.PROGRESS,
            ProgressBarID.FIND,
            current,
            target
        ));
    }
}


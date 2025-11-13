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
import { ThingTypeStorage } from "../things/ThingTypeStorage";
import { SpriteStorage } from "../sprites/SpriteStorage";
import { ThingType } from "../things/ThingType";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameGroupType } from "../things/FrameGroupType";
import { ThingData } from "../things/ThingData";
import { ThingCategory } from "../things/ThingCategory";
import { SpriteData } from "../sprites/SpriteData";
import { ByteArray } from "../utils/ByteArray";
import { OBDVersions } from "../obd/OBDVersions";
import { ThingUtils } from "./ThingUtils";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { Resources } from "../resources/Resources";
import { SpriteExtent } from "./SpriteExtent";

export class FrameGroupsConverter extends EventEmitter {
    private _objects: ThingTypeStorage;
    private _sprites: SpriteStorage;
    private _finished: boolean = false;
    private _frameGroups: boolean;
    private _removeMounts: boolean;
    private _clientVersion: number;
    private _improvedAnimations: boolean;
    private _defaultDuration: number;

    constructor(objects: ThingTypeStorage,
                sprites: SpriteStorage,
                frameGroups: boolean,
                removeMounts: boolean,
                clientVersion: number,
                improvedAnimations: boolean,
                duration: number) {
        super();

        if (!objects) {
            throw new Error("objects cannot be null");
        }

        this._objects = objects;
        this._sprites = sprites;
        this._frameGroups = frameGroups;
        this._removeMounts = removeMounts;
        this._clientVersion = clientVersion;
        this._improvedAnimations = improvedAnimations;
        this._defaultDuration = duration;
    }

    public start(): void {
        if (this._finished) return;

        let step = 0;
        const steps = this._objects.outfits.size;

        for (const thing of this._objects.outfits.values()) {
            const thingData = this.getOutfitData(thing.id);
            if (thingData) {
                this.dispatchProgress(step++, steps, Resources.getString("convertOutfits"));
                let frameGroups = ThingUtils.REMOVE_FRAME_GROUPS;
                if (this._frameGroups) {
                    frameGroups = ThingUtils.ADD_FRAME_GROUPS;
                }

                ThingUtils.convertFrameGroups(thingData, frameGroups, this._improvedAnimations, this._defaultDuration, this._removeMounts);
            }
        }

        this._finished = true;
        this.emit("complete");
    }

    private getOutfitData(id: number): ThingData | null {
        if (!ThingCategory.getCategory(ThingCategory.OUTFIT)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        const thing = this._objects.getThingType(id, ThingCategory.OUTFIT);
        if (!thing) {
            throw new Error(Resources.getString(
                "thingNotFound",
                Resources.getString(ThingCategory.OUTFIT),
                id));
        }

        const sprites = new Map<number, SpriteData[]>();
        for (let groupType = FrameGroupType.DEFAULT; groupType <= FrameGroupType.WALKING; groupType++) {
            const frameGroup = thing.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }

            sprites.set(groupType, []);

            const spriteIndex = frameGroup.spriteIndex;
            if (!spriteIndex) {
                continue;
            }

            const length = spriteIndex.length;
            for (let i = 0; i < length; i++) {
                const spriteId = spriteIndex[i];
                let pixels: Buffer | null = this._sprites.getPixels(spriteId);
                if (!pixels) {
                    const alertSprite = this._sprites.alertSprite;
                    if (alertSprite) {
                        const alertPixels = alertSprite.getPixels();
                        pixels = alertPixels instanceof Buffer ? alertPixels : alertPixels.toBuffer();
                    } else {
                        pixels = Buffer.alloc(SpriteExtent.DEFAULT_DATA_SIZE);
                    }
                }

                const spriteData = new SpriteData();
                spriteData.id = spriteId;
                if (pixels) {
                    spriteData.pixels = pixels; // Already a Buffer
                }
                sprites.get(groupType)!.push(spriteData);
            }
        }

        return ThingData.create(OBDVersions.OBD_VERSION_2, this._clientVersion, thing, sprites);
    }

    private dispatchProgress(current: number, target: number, label: string): void {
        this.emit("progress", new ProgressEvent(
            ProgressEvent.PROGRESS,
            ProgressBarID.FIND,
            current,
            target,
            label
        ));
    }
}


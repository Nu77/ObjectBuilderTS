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
exports.FrameGroupsConverter = void 0;
const events_1 = require("events");
const FrameGroupType_1 = require("../things/FrameGroupType");
const ThingData_1 = require("../things/ThingData");
const ThingCategory_1 = require("../things/ThingCategory");
const SpriteData_1 = require("../sprites/SpriteData");
const OBDVersions_1 = require("../obd/OBDVersions");
const ThingUtils_1 = require("./ThingUtils");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const Resources_1 = require("../resources/Resources");
const SpriteExtent_1 = require("./SpriteExtent");
class FrameGroupsConverter extends events_1.EventEmitter {
    constructor(objects, sprites, frameGroups, removeMounts, clientVersion, improvedAnimations, duration) {
        super();
        this._finished = false;
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
    start() {
        if (this._finished)
            return;
        let step = 0;
        const steps = this._objects.outfits.size;
        for (const thing of this._objects.outfits.values()) {
            const thingData = this.getOutfitData(thing.id);
            if (thingData) {
                this.dispatchProgress(step++, steps, Resources_1.Resources.getString("convertOutfits"));
                let frameGroups = ThingUtils_1.ThingUtils.REMOVE_FRAME_GROUPS;
                if (this._frameGroups) {
                    frameGroups = ThingUtils_1.ThingUtils.ADD_FRAME_GROUPS;
                }
                ThingUtils_1.ThingUtils.convertFrameGroups(thingData, frameGroups, this._improvedAnimations, this._defaultDuration, this._removeMounts);
            }
        }
        this._finished = true;
        this.emit("complete");
    }
    getOutfitData(id) {
        if (!ThingCategory_1.ThingCategory.getCategory(ThingCategory_1.ThingCategory.OUTFIT)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        const thing = this._objects.getThingType(id, ThingCategory_1.ThingCategory.OUTFIT);
        if (!thing) {
            throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(ThingCategory_1.ThingCategory.OUTFIT), id));
        }
        const sprites = new Map();
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
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
                let pixels = this._sprites.getPixels(spriteId);
                if (!pixels) {
                    const alertSprite = this._sprites.alertSprite;
                    if (alertSprite) {
                        const alertPixels = alertSprite.getPixels();
                        pixels = alertPixels instanceof Buffer ? alertPixels : alertPixels.toBuffer();
                    }
                    else {
                        pixels = Buffer.alloc(SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE);
                    }
                }
                const spriteData = new SpriteData_1.SpriteData();
                spriteData.id = spriteId;
                if (pixels) {
                    spriteData.pixels = pixels; // Already a Buffer
                }
                sprites.get(groupType).push(spriteData);
            }
        }
        return ThingData_1.ThingData.create(OBDVersions_1.OBDVersions.OBD_VERSION_2, this._clientVersion, thing, sprites);
    }
    dispatchProgress(current, target, label) {
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.FIND, current, target, label));
    }
}
exports.FrameGroupsConverter = FrameGroupsConverter;

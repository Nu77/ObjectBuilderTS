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
exports.SpritesFinder = void 0;
const events_1 = require("events");
const FrameGroupType_1 = require("../../otlib/things/FrameGroupType");
const SpriteData_1 = require("../../otlib/sprites/SpriteData");
const ProgressEvent_1 = require("../../otlib/events/ProgressEvent");
const ProgressBarID_1 = require("../commands/ProgressBarID");
class SpritesFinder extends events_1.EventEmitter {
    get foundList() {
        return this._foundList;
    }
    constructor(dat, spr) {
        super();
        this._foundList = [];
        this._finished = false;
        if (!dat) {
            throw new Error("dat cannot be null");
        }
        if (!spr) {
            throw new Error("spr cannot be null");
        }
        this._dat = dat;
        this._spr = spr;
    }
    start(unusedSprites, emptySprites) {
        if (this._finished)
            return;
        if (unusedSprites || emptySprites) {
            const length = this._spr.spritesCount + 1;
            let i = 0;
            const spriteFoundList = [];
            const usedList = new Array(length).fill(false);
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
                        const spriteData = new SpriteData_1.SpriteData();
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
            else {
                // Get all empty sprites
                for (i = 1; i < length; i++) {
                    if (this._spr.isEmptySprite(i)) {
                        const spriteData = new SpriteData_1.SpriteData();
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
    scanList(list, usedList) {
        for (const thing of list.values()) {
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
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
    dispatchProgress(current, target) {
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.FIND, current, target));
    }
}
exports.SpritesFinder = SpritesFinder;

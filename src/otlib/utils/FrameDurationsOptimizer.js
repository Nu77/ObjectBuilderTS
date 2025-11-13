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
exports.FrameDurationsOptimizer = void 0;
const events_1 = require("events");
const FrameGroupType_1 = require("../things/FrameGroupType");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const Resources_1 = require("../resources/Resources");
class FrameDurationsOptimizer extends events_1.EventEmitter {
    constructor(objects, items, itemsMinimumDuration, itemsMaximumDuration, outfits, outfitsMinimumDuration, outfitsMaximumDuration, effects, effectsMinimumDuration, effectsMaximumDuration) {
        super();
        this._finished = false;
        if (!objects) {
            throw new Error("objects cannot be null");
        }
        this._objects = objects;
        this._itemsEnabled = items;
        this._itemsMinimumDuration = itemsMinimumDuration;
        this._itemsMaximumDuration = itemsMaximumDuration;
        this._outfitsEnabled = outfits;
        this._outfitsMinimumDuration = outfitsMinimumDuration;
        this._outfitsMaximumDuration = outfitsMaximumDuration;
        this._effectsEnabled = effects;
        this._effectsMinimumDuration = effectsMinimumDuration;
        this._effectsMaximumDuration = effectsMaximumDuration;
    }
    start() {
        if (this._finished)
            return;
        const steps = 5;
        let step = 0;
        this.dispatchProgress(step++, steps, Resources_1.Resources.getString("startingTheOptimization"));
        this.dispatchProgress(step++, steps, Resources_1.Resources.getString("changingDurationsInItems"));
        if (this._itemsEnabled) {
            this.changeFrameDurations(this._objects.items, this._itemsMinimumDuration, this._itemsMaximumDuration);
        }
        this.dispatchProgress(step++, steps, Resources_1.Resources.getString("changingDurationsInOutfits"));
        if (this._outfitsEnabled) {
            this.changeFrameDurations(this._objects.outfits, this._outfitsMinimumDuration, this._outfitsMaximumDuration);
        }
        this.dispatchProgress(step++, steps, Resources_1.Resources.getString("changingDurationsInEffects"));
        if (this._effectsEnabled) {
            this.changeFrameDurations(this._objects.effects, this._effectsMinimumDuration, this._effectsMaximumDuration);
        }
        this._finished = true;
        this.emit("complete");
    }
    changeFrameDurations(list, minimum, maximum) {
        for (const thing of list.values()) {
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
                const frameGroup = thing.getFrameGroup(groupType);
                if (!frameGroup || !frameGroup.frameDurations) {
                    continue;
                }
                for (let frame = 0; frame < frameGroup.frames; frame++) {
                    const duration = frameGroup.getFrameDuration(frame);
                    if (duration) {
                        duration.minimum = minimum;
                        duration.maximum = maximum;
                        frameGroup.frameDurations[frame] = duration.clone();
                    }
                }
            }
        }
    }
    dispatchProgress(current, target, label) {
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.FIND, current, target, label));
    }
}
exports.FrameDurationsOptimizer = FrameDurationsOptimizer;

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
import { ThingType } from "../things/ThingType";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameGroupType } from "../things/FrameGroupType";
import { FrameDuration } from "../animation/FrameDuration";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { Resources } from "../resources/Resources";

export class FrameDurationsOptimizer extends EventEmitter {
    private _objects: ThingTypeStorage;
    private _finished: boolean = false;
    private _itemsEnabled: boolean;
    private _itemsMinimumDuration: number;
    private _itemsMaximumDuration: number;
    private _outfitsEnabled: boolean;
    private _outfitsMinimumDuration: number;
    private _outfitsMaximumDuration: number;
    private _effectsEnabled: boolean;
    private _effectsMinimumDuration: number;
    private _effectsMaximumDuration: number;

    constructor(objects: ThingTypeStorage,
                items: boolean, itemsMinimumDuration: number, itemsMaximumDuration: number,
                outfits: boolean, outfitsMinimumDuration: number, outfitsMaximumDuration: number,
                effects: boolean, effectsMinimumDuration: number, effectsMaximumDuration: number) {
        super();

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

    public start(): void {
        if (this._finished) return;

        const steps = 5;
        let step = 0;

        this.dispatchProgress(step++, steps, Resources.getString("startingTheOptimization"));
        this.dispatchProgress(step++, steps, Resources.getString("changingDurationsInItems"));
        if (this._itemsEnabled) {
            this.changeFrameDurations(this._objects.items, this._itemsMinimumDuration, this._itemsMaximumDuration);
        }

        this.dispatchProgress(step++, steps, Resources.getString("changingDurationsInOutfits"));
        if (this._outfitsEnabled) {
            this.changeFrameDurations(this._objects.outfits, this._outfitsMinimumDuration, this._outfitsMaximumDuration);
        }

        this.dispatchProgress(step++, steps, Resources.getString("changingDurationsInEffects"));
        if (this._effectsEnabled) {
            this.changeFrameDurations(this._objects.effects, this._effectsMinimumDuration, this._effectsMaximumDuration);
        }

        this._finished = true;
        this.emit("complete");
    }

    private changeFrameDurations(list: Map<number, ThingType>, minimum: number, maximum: number): void {
        for (const thing of list.values()) {
            for (let groupType = FrameGroupType.DEFAULT; groupType <= FrameGroupType.WALKING; groupType++) {
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


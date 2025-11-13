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
import { Sprite } from "../sprites/Sprite";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { Resources } from "../resources/Resources";

export class SpritesOptimizer extends EventEmitter {
    private _objects: ThingTypeStorage;
    private _sprites: SpriteStorage;
    private _finished: boolean = false;
    private _oldIDs: (Sprite | null)[] = [];
    private _hashes: Map<string, number> = new Map();
    private _newIDs: Map<number, number> = new Map();
    private _removedCount: number = 0;
    private _oldCount: number = 0;
    private _newCount: number = 0;

    public get removedCount(): number { return this._removedCount; }
    public get oldCount(): number { return this._oldCount; }
    public get newCount(): number { return this._newCount; }

    constructor(objects: ThingTypeStorage, sprites: SpriteStorage) {
        super();

        if (!objects) {
            throw new Error("objects cannot be null");
        }

        if (!sprites) {
            throw new Error("sprites cannot be null");
        }

        this._objects = objects;
        this._sprites = sprites;
    }

    public start(): void {
        if (this._finished) return;

        const length = this._sprites.spritesCount + 1;
        const steps = 9;
        let step = 0;

        this.dispatchProgress(step++, steps, Resources.getString("startingTheOptimization"));

        this._oldIDs = new Array(length).fill(null);
        this._hashes = new Map();
        this._newIDs = new Map();

        // Hash all sprites
        this.dispatchProgress(step++, steps, Resources.getString("hasingSprites"));
        for (let id = 1; id < length; id++) {
            const sprite = this._sprites.getSprite(id);
            if (sprite) {
                this._oldIDs[id] = sprite;
                this._newIDs.set(id, id);

                const hash = sprite.getHash();
                if (!hash) {
                    this._newIDs.set(id, id);
                } else if (!this._hashes.has(hash)) {
                    this._newIDs.set(id, id);
                    this._hashes.set(hash, id);
                } else {
                    this._newIDs.set(id, this._hashes.get(hash)!);
                }
            }
        }

        // Replace duplicated sprites found on hashing
        this.dispatchProgress(step++, steps, Resources.getString("resettingDuplicateSprites"));

        this.setNewIDsAfterHashing(this._objects.items);
        this.setNewIDsAfterHashing(this._objects.outfits);
        this.setNewIDsAfterHashing(this._objects.effects);
        this.setNewIDsAfterHashing(this._objects.missiles);

        // Scan lists finding unused ids
        this.dispatchProgress(step++, steps, Resources.getString("searchingForUnusedSprites"));

        const freeIDs: boolean[] = new Array(length).fill(false);
        const usedList: boolean[] = new Array(length).fill(false);

        this.scanList(this._objects.items, usedList);
        this.scanList(this._objects.outfits, usedList);
        this.scanList(this._objects.effects, usedList);
        this.scanList(this._objects.missiles, usedList);

        // Get all unused/empty ids
        this.dispatchProgress(step++, steps, Resources.getString("gettingFreeIds"));

        for (let i = 1; i < length; i++) {
            if (!usedList[i] || (this._oldIDs[i] && this._oldIDs[i]!.isEmpty)) {
                freeIDs[i] = true;
            }
        }

        // Replace all free ids and organize indices
        this._newIDs = new Map();
        this.dispatchProgress(step++, steps, Resources.getString("organizingSprites"));

        let index = 1;
        let count = 0;

        for (let i = 1; i < length; i++, index++) {
            while (index < length && freeIDs[index]) {
                index++;
                count++;
            }

            if (index > this._sprites.spritesCount) break;

            const sprite = this._oldIDs[index];
            if (sprite) {
                sprite.id = i;
                this._newIDs.set(i, index);
            }
        }

        // Update the ids of all lists
        this.dispatchProgress(step++, steps, Resources.getString("updatingObjects"));

        if (count > 0) {
            this.setNewIDs(this._objects.items);
            this.setNewIDs(this._objects.outfits);
            this.setNewIDs(this._objects.effects);
            this.setNewIDs(this._objects.missiles);

            // TODO: Update sprite storage internal structure
            // This requires access to _sprites Map in SpriteStorage
            // For now, we'll mark it as needing implementation
            this.dispatchProgress(step++, steps, Resources.getString("finalizingTheOptimization"));

            this._objects.invalidate();
            // Note: Direct manipulation of _sprites would require making it accessible
            // or adding methods to SpriteStorage for optimization
            this._sprites.invalidate();
        }

        this._removedCount = count;
        this._oldCount = length - 1;
        this._newCount = this._sprites.spritesCount;
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

                for (let i = spriteIDs.length - 1; i >= 0; i--) {
                    const spriteId = spriteIDs[i];
                    if (spriteId < usedList.length) {
                        usedList[spriteId] = true;
                    }
                }
            }
        }
    }

    private setNewIDsAfterHashing(list: Map<number, ThingType>): void {
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

                for (let i = spriteIDs.length - 1; i >= 0; i--) {
                    if (spriteIDs[i] !== 0) {
                        const newId = this._newIDs.get(spriteIDs[i]);
                        if (newId !== undefined) {
                            spriteIDs[i] = newId;
                        }
                    }
                }
            }
        }
    }

    private setNewIDs(list: Map<number, ThingType>): void {
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

                for (let i = spriteIDs.length - 1; i >= 0; i--) {
                    if (spriteIDs[i] !== 0) {
                        const oldSprite = this._oldIDs[spriteIDs[i]];
                        if (oldSprite) {
                            spriteIDs[i] = oldSprite.id;
                        }
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


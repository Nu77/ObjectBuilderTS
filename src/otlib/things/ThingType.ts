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

import { FrameGroup } from "../animation/FrameGroup";
import { FrameGroupType } from "./FrameGroupType";
import { FrameDuration } from "../animation/FrameDuration";
import { AnimationMode } from "../animation/AnimationMode";
import { ThingCategory } from "./ThingCategory";
import { Resources } from "../resources/Resources";

export class ThingType {
    public id: number = 0;
    public category: string = "";
    public isGround: boolean = false;
    public groundSpeed: number = 0;
    public isGroundBorder: boolean = false;
    public isOnBottom: boolean = false;
    public isOnTop: boolean = false;
    public isContainer: boolean = false;
    public stackable: boolean = false;
    public forceUse: boolean = false;
    public multiUse: boolean = false;
    public hasCharges: boolean = false;
    public writable: boolean = false;
    public writableOnce: boolean = false;
    public maxTextLength: number = 0;
    public isFluidContainer: boolean = false;
    public isFluid: boolean = false;
    public isUnpassable: boolean = false;
    public isUnmoveable: boolean = false;
    public blockMissile: boolean = false;
    public blockPathfind: boolean = false;
    public noMoveAnimation: boolean = false;
    public pickupable: boolean = false;
    public hangable: boolean = false;
    public isVertical: boolean = false;
    public isHorizontal: boolean = false;
    public rotatable: boolean = false;
    public hasLight: boolean = false;
    public lightLevel: number = 0;
    public lightColor: number = 0;
    public dontHide: boolean = false;
    public isTranslucent: boolean = false;
    public floorChange: boolean = false;
    public hasOffset: boolean = false;
    public offsetX: number = 0;
    public offsetY: number = 0;
    public hasElevation: boolean = false;
    public elevation: number = 0;
    public isLyingObject: boolean = false;
    public animateAlways: boolean = false;
    public miniMap: boolean = false;
    public miniMapColor: number = 0;
    public isLensHelp: boolean = false;
    public lensHelp: number = 0;
    public isFullGround: boolean = false;
    public ignoreLook: boolean = false;
    public cloth: boolean = false;
    public clothSlot: number = 0;
    public isMarketItem: boolean = false;
    public marketName: string = "";
    public marketCategory: number = 0;
    public marketTradeAs: number = 0;
    public marketShowAs: number = 0;
    public marketRestrictProfession: number = 0;
    public marketRestrictLevel: number = 0;
    public hasDefaultAction: boolean = false;
    public defaultAction: number = 0;
    public wrappable: boolean = false;
    public unwrappable: boolean = false;
    public topEffect: boolean = false;
    public usable: boolean = false;

    public frameGroups: (FrameGroup | null)[] = [];

    constructor() {
        this.frameGroups = [];
    }

    public toString(): string {
        return `[ThingType category=${this.category}, id=${this.id}]`;
    }

    public getFrameGroup(groupType: number): FrameGroup | null {
        return this.frameGroups[groupType] || null;
    }

    public setFrameGroup(groupType: number, frameGroup: FrameGroup): void {
        frameGroup.type = groupType;
        this.frameGroups[groupType] = frameGroup;
    }

    public clone(): ThingType {
        const newThing = new ThingType();
        
        // Copy all properties
        Object.keys(this).forEach(key => {
            if (key !== "frameGroups") {
                (newThing as any)[key] = (this as any)[key];
            }
        });

        newThing.frameGroups = [];
        for (let groupType = FrameGroupType.DEFAULT; groupType <= FrameGroupType.WALKING; groupType++) {
            const group = this.getFrameGroup(groupType);
            if (group) {
                newThing.setFrameGroup(groupType, group.clone());
            }
        }

        return newThing;
    }

    private getFrameIndexes(frameGroup: FrameGroup | null, spriteLength: number, firstIndex: number = 0): number[] {
        const spriteIndex: number[] = [];
        if (!frameGroup || !frameGroup.spriteIndex) {
            return spriteIndex;
        }

        for (let index = firstIndex; index < spriteLength && index < frameGroup.spriteIndex.length; index++) {
            spriteIndex.push(frameGroup.spriteIndex[index]);
        }

        return spriteIndex;
    }

    public addFrameGroupState(improvedAnimations: boolean, duration: number): void {
        const normal = this.getFrameGroup(FrameGroupType.DEFAULT);
        if (!normal || normal.frames < 3) {
            return;
        }

        const idle = normal.clone();
        idle.frames = 1;

        const idleSprites = idle.getTotalSprites();
        idle.spriteIndex = this.getFrameIndexes(normal, idleSprites);
        idle.isAnimation = false;
        idle.frameDurations = null;
        idle.animationMode = AnimationMode.ASYNCHRONOUS;
        idle.loopCount = 0;
        idle.startFrame = 0;

        const walking = normal.clone();
        walking.frames = normal.frames - 1;
        walking.spriteIndex = this.getFrameIndexes(normal, normal.getTotalSprites(), idleSprites);
        walking.isAnimation = false;

        if (walking.frames > 1) {
            walking.isAnimation = true;
        }

        walking.frameDurations = new Array<FrameDuration>(walking.frames);
        walking.animationMode = AnimationMode.ASYNCHRONOUS;
        walking.loopCount = 0;
        walking.startFrame = 0;

        for (let frameId = 0; frameId < walking.frames; frameId++) {
            if (improvedAnimations && normal.frameDurations && normal.frameDurations[frameId]) {
                walking.frameDurations[frameId] = normal.frameDurations[frameId].clone();
            } else {
                walking.frameDurations[frameId] = new FrameDuration(duration, duration);
            }
        }

        this.setFrameGroup(FrameGroupType.DEFAULT, idle);
        this.setFrameGroup(FrameGroupType.WALKING, walking);
    }

    private countSpritesInFrame(frameGroup: FrameGroup, frame: number): number {
        let sprites = 0;
        for (let z = 0; z < frameGroup.patternZ; z++) {
            for (let y = 0; y < frameGroup.patternY; y++) {
                for (let x = 0; x < frameGroup.patternX; x++) {
                    for (let l = 0; l < frameGroup.layers; l++) {
                        for (let w = 0; w < frameGroup.width; w++) {
                            for (let h = 0; h < frameGroup.height; h++) {
                                sprites++;
                            }
                        }
                    }
                }
            }
        }
        return sprites;
    }

    public removeFrameGroupState(improvedAnimations: boolean, duration: number, removeMounts: boolean): void {
        const idle = this.getFrameGroup(FrameGroupType.DEFAULT);
        const walking = this.getFrameGroup(FrameGroupType.WALKING);
        if (!idle && !walking) {
            return;
        }

        if (removeMounts && idle && walking) {
            idle.patternZ = 1;
            walking.patternZ = 1;
        }

        if (!idle) return;

        const normal = idle.clone();
        normal.frames = 3;

        const spriteIndex: number[] = [];

        const frameSpriteLength = this.countSpritesInFrame(idle, 0);
        if (idle.spriteIndex) {
            for (let spriteId = 0; spriteId < frameSpriteLength && spriteId < idle.spriteIndex.length; spriteId++) {
                spriteIndex.push(idle.spriteIndex[spriteId]);
            }
        }

        if (walking && walking.spriteIndex) {
            for (let spriteId = 0; spriteId < frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                spriteIndex.push(walking.spriteIndex[spriteId]);
            }

            const walkingFramesLength = walking.spriteIndex.length;
            if (walkingFramesLength > frameSpriteLength * 4) {
                // Check for fourth frame in walking
                for (let spriteId = frameSpriteLength * 4; spriteId < (frameSpriteLength * 4) + frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                    spriteIndex.push(walking.spriteIndex[spriteId]);
                }
            } else if (walkingFramesLength > frameSpriteLength) {
                // Check for second frame in walking
                for (let spriteId = frameSpriteLength; spriteId < frameSpriteLength + frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                    spriteIndex.push(walking.spriteIndex[spriteId]);
                }
            } else {
                // Add first frame in walking
                for (let spriteId = 0; spriteId < frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                    spriteIndex.push(walking.spriteIndex[spriteId]);
                }
            }
        }

        normal.spriteIndex = spriteIndex;
        normal.isAnimation = true;
        normal.frameDurations = new Array<FrameDuration>(normal.frames);
        normal.animationMode = AnimationMode.ASYNCHRONOUS;
        normal.loopCount = 0;
        normal.startFrame = 0;

        for (let frameId = 0; frameId < normal.frames; frameId++) {
            normal.frameDurations[frameId] = new FrameDuration(duration, duration);
        }

        this.frameGroups = [];
        this.frameGroups[FrameGroupType.DEFAULT] = normal;
    }

    public static create(id: number, category: string, frameGroups: boolean, duration: number): ThingType {
        if (!ThingCategory.getCategory(category)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        const thing = new ThingType();
        thing.category = category;
        thing.id = id;

        let group: FrameGroup;
        if (category === ThingCategory.OUTFIT) {
            const groups = frameGroups ? FrameGroupType.WALKING : FrameGroupType.DEFAULT;

            for (let groupType = FrameGroupType.DEFAULT; groupType <= groups; groupType++) {
                group = new FrameGroup();
                group.type = groupType;
                group.makeOutfitGroup(duration);

                thing.setFrameGroup(groupType, group);
            }
        } else {
            group = new FrameGroup();
            if (category === ThingCategory.MISSILE) {
                group.patternX = 3;
                group.patternY = 3;
            }

            group.spriteIndex = new Array<number>(group.getTotalSprites());
            thing.setFrameGroup(FrameGroupType.DEFAULT, group);
        }

        return thing;
    }
}


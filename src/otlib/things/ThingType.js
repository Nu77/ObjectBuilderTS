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
exports.ThingType = void 0;
const FrameGroup_1 = require("../animation/FrameGroup");
const FrameGroupType_1 = require("./FrameGroupType");
const FrameDuration_1 = require("../animation/FrameDuration");
const AnimationMode_1 = require("../animation/AnimationMode");
const ThingCategory_1 = require("./ThingCategory");
const Resources_1 = require("../resources/Resources");
class ThingType {
    constructor() {
        this.id = 0;
        this.category = "";
        this.isGround = false;
        this.groundSpeed = 0;
        this.isGroundBorder = false;
        this.isOnBottom = false;
        this.isOnTop = false;
        this.isContainer = false;
        this.stackable = false;
        this.forceUse = false;
        this.multiUse = false;
        this.hasCharges = false;
        this.writable = false;
        this.writableOnce = false;
        this.maxTextLength = 0;
        this.isFluidContainer = false;
        this.isFluid = false;
        this.isUnpassable = false;
        this.isUnmoveable = false;
        this.blockMissile = false;
        this.blockPathfind = false;
        this.noMoveAnimation = false;
        this.pickupable = false;
        this.hangable = false;
        this.isVertical = false;
        this.isHorizontal = false;
        this.rotatable = false;
        this.hasLight = false;
        this.lightLevel = 0;
        this.lightColor = 0;
        this.dontHide = false;
        this.isTranslucent = false;
        this.floorChange = false;
        this.hasOffset = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.hasElevation = false;
        this.elevation = 0;
        this.isLyingObject = false;
        this.animateAlways = false;
        this.miniMap = false;
        this.miniMapColor = 0;
        this.isLensHelp = false;
        this.lensHelp = 0;
        this.isFullGround = false;
        this.ignoreLook = false;
        this.cloth = false;
        this.clothSlot = 0;
        this.isMarketItem = false;
        this.marketName = "";
        this.marketCategory = 0;
        this.marketTradeAs = 0;
        this.marketShowAs = 0;
        this.marketRestrictProfession = 0;
        this.marketRestrictLevel = 0;
        this.hasDefaultAction = false;
        this.defaultAction = 0;
        this.wrappable = false;
        this.unwrappable = false;
        this.topEffect = false;
        this.usable = false;
        this.frameGroups = [];
        this.frameGroups = [];
    }
    toString() {
        return `[ThingType category=${this.category}, id=${this.id}]`;
    }
    getFrameGroup(groupType) {
        return this.frameGroups[groupType] || null;
    }
    setFrameGroup(groupType, frameGroup) {
        frameGroup.type = groupType;
        this.frameGroups[groupType] = frameGroup;
    }
    clone() {
        const newThing = new ThingType();
        // Copy all properties
        Object.keys(this).forEach(key => {
            if (key !== "frameGroups") {
                newThing[key] = this[key];
            }
        });
        newThing.frameGroups = [];
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const group = this.getFrameGroup(groupType);
            if (group) {
                newThing.setFrameGroup(groupType, group.clone());
            }
        }
        return newThing;
    }
    getFrameIndexes(frameGroup, spriteLength, firstIndex = 0) {
        const spriteIndex = [];
        if (!frameGroup || !frameGroup.spriteIndex) {
            return spriteIndex;
        }
        for (let index = firstIndex; index < spriteLength && index < frameGroup.spriteIndex.length; index++) {
            spriteIndex.push(frameGroup.spriteIndex[index]);
        }
        return spriteIndex;
    }
    addFrameGroupState(improvedAnimations, duration) {
        const normal = this.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        if (!normal || normal.frames < 3) {
            return;
        }
        const idle = normal.clone();
        idle.frames = 1;
        const idleSprites = idle.getTotalSprites();
        idle.spriteIndex = this.getFrameIndexes(normal, idleSprites);
        idle.isAnimation = false;
        idle.frameDurations = null;
        idle.animationMode = AnimationMode_1.AnimationMode.ASYNCHRONOUS;
        idle.loopCount = 0;
        idle.startFrame = 0;
        const walking = normal.clone();
        walking.frames = normal.frames - 1;
        walking.spriteIndex = this.getFrameIndexes(normal, normal.getTotalSprites(), idleSprites);
        walking.isAnimation = false;
        if (walking.frames > 1) {
            walking.isAnimation = true;
        }
        walking.frameDurations = new Array(walking.frames);
        walking.animationMode = AnimationMode_1.AnimationMode.ASYNCHRONOUS;
        walking.loopCount = 0;
        walking.startFrame = 0;
        for (let frameId = 0; frameId < walking.frames; frameId++) {
            if (improvedAnimations && normal.frameDurations && normal.frameDurations[frameId]) {
                walking.frameDurations[frameId] = normal.frameDurations[frameId].clone();
            }
            else {
                walking.frameDurations[frameId] = new FrameDuration_1.FrameDuration(duration, duration);
            }
        }
        this.setFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT, idle);
        this.setFrameGroup(FrameGroupType_1.FrameGroupType.WALKING, walking);
    }
    countSpritesInFrame(frameGroup, frame) {
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
    removeFrameGroupState(improvedAnimations, duration, removeMounts) {
        const idle = this.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        const walking = this.getFrameGroup(FrameGroupType_1.FrameGroupType.WALKING);
        if (!idle && !walking) {
            return;
        }
        if (removeMounts && idle && walking) {
            idle.patternZ = 1;
            walking.patternZ = 1;
        }
        if (!idle)
            return;
        const normal = idle.clone();
        normal.frames = 3;
        const spriteIndex = [];
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
            }
            else if (walkingFramesLength > frameSpriteLength) {
                // Check for second frame in walking
                for (let spriteId = frameSpriteLength; spriteId < frameSpriteLength + frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                    spriteIndex.push(walking.spriteIndex[spriteId]);
                }
            }
            else {
                // Add first frame in walking
                for (let spriteId = 0; spriteId < frameSpriteLength && spriteId < walking.spriteIndex.length; spriteId++) {
                    spriteIndex.push(walking.spriteIndex[spriteId]);
                }
            }
        }
        normal.spriteIndex = spriteIndex;
        normal.isAnimation = true;
        normal.frameDurations = new Array(normal.frames);
        normal.animationMode = AnimationMode_1.AnimationMode.ASYNCHRONOUS;
        normal.loopCount = 0;
        normal.startFrame = 0;
        for (let frameId = 0; frameId < normal.frames; frameId++) {
            normal.frameDurations[frameId] = new FrameDuration_1.FrameDuration(duration, duration);
        }
        this.frameGroups = [];
        this.frameGroups[FrameGroupType_1.FrameGroupType.DEFAULT] = normal;
    }
    static create(id, category, frameGroups, duration) {
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        const thing = new ThingType();
        thing.category = category;
        thing.id = id;
        let group;
        if (category === ThingCategory_1.ThingCategory.OUTFIT) {
            const groups = frameGroups ? FrameGroupType_1.FrameGroupType.WALKING : FrameGroupType_1.FrameGroupType.DEFAULT;
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= groups; groupType++) {
                group = new FrameGroup_1.FrameGroup();
                group.type = groupType;
                group.makeOutfitGroup(duration);
                thing.setFrameGroup(groupType, group);
            }
        }
        else {
            group = new FrameGroup_1.FrameGroup();
            if (category === ThingCategory_1.ThingCategory.MISSILE) {
                group.patternX = 3;
                group.patternY = 3;
            }
            group.spriteIndex = new Array(group.getTotalSprites());
            thing.setFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT, group);
        }
        return thing;
    }
}
exports.ThingType = ThingType;

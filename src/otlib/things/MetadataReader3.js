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
exports.MetadataReader3 = void 0;
const FrameGroup_1 = require("../animation/FrameGroup");
const FrameDuration_1 = require("../animation/FrameDuration");
const ThingCategory_1 = require("./ThingCategory");
const MetadataReader_1 = require("./MetadataReader");
const MetadataFlags3_1 = require("./MetadataFlags3");
const SpriteExtent_1 = require("../utils/SpriteExtent");
/**
 * Reader for versions 7.55 - 7.72
 */
class MetadataReader3 extends MetadataReader_1.MetadataReader {
    constructor(bytes) {
        super(bytes);
    }
    readProperties(type) {
        let flag = 0;
        while (flag < MetadataFlags3_1.MetadataFlags3.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();
            if (flag === MetadataFlags3_1.MetadataFlags3.LAST_FLAG) {
                return true;
            }
            switch (flag) {
                case MetadataFlags3_1.MetadataFlags3.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.ON_TOP:
                    type.isOnTop = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.CONTAINER:
                    type.isContainer = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.STACKABLE:
                    type.stackable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.MULTI_USE:
                    type.multiUse = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.FORCE_USE:
                    type.forceUse = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.FLUID:
                    type.isFluid = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.UNPASSABLE:
                    type.isUnpassable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.BLOCK_PATHFINDER:
                    type.blockPathfind = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.PICKUPABLE:
                    type.pickupable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.HANGABLE:
                    type.hangable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.VERTICAL:
                    type.isVertical = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.HORIZONTAL:
                    type.isHorizontal = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.ROTATABLE:
                    type.rotatable = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.FLOOR_CHANGE:
                    type.floorChange = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;
                case MetadataFlags3_1.MetadataFlags3.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;
                case MetadataFlags3_1.MetadataFlags3.FULL_GROUND:
                    type.isFullGround = true;
                    break;
                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${type.category}, id: ${type.id})`);
            }
        }
        return true;
    }
    readTexturePatterns(type, extended, frameDurations, frameGroups) {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = this.readUnsignedByte();
        }
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
                this.readUnsignedByte(); // Skip group type
            }
            const frameGroup = new FrameGroup_1.FrameGroup();
            frameGroup.type = groupType;
            frameGroup.width = this.readUnsignedByte();
            frameGroup.height = this.readUnsignedByte();
            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = this.readUnsignedByte();
            }
            else {
                frameGroup.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
            }
            frameGroup.layers = this.readUnsignedByte();
            frameGroup.patternX = this.readUnsignedByte();
            frameGroup.patternY = this.readUnsignedByte();
            frameGroup.patternZ = this.readUnsignedByte(); // Version 3 supports patternZ
            frameGroup.frames = this.readUnsignedByte();
            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.frameDurations = new Array(frameGroup.frames);
                if (frameDurations && this.settings) {
                    frameGroup.animationMode = this.readUnsignedByte();
                    frameGroup.loopCount = this.readInt();
                    frameGroup.startFrame = this.readByte();
                    for (let i = 0; i < frameGroup.frames; i++) {
                        const minimum = this.readUnsignedInt();
                        const maximum = this.readUnsignedInt();
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(minimum, maximum);
                    }
                }
                else if (this.settings) {
                    const duration = this.settings.getDefaultDuration(type.category);
                    for (let i = 0; i < frameGroup.frames; i++) {
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(duration, duration);
                    }
                }
            }
            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`A thing type has more than ${SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }
            frameGroup.spriteIndex = new Array(totalSprites);
            for (let i = 0; i < totalSprites; i++) {
                if (extended) {
                    frameGroup.spriteIndex[i] = this.readUnsignedInt();
                }
                else {
                    frameGroup.spriteIndex[i] = this.readUnsignedShort();
                }
            }
            type.setFrameGroup(groupType, frameGroup);
        }
        return true;
    }
}
exports.MetadataReader3 = MetadataReader3;

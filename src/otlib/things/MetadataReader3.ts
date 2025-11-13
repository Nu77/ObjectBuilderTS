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

import { ByteArray } from "../utils/ByteArray";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameDuration } from "../animation/FrameDuration";
import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { MetadataReader } from "./MetadataReader";
import { MetadataFlags3 } from "./MetadataFlags3";
import { SpriteExtent } from "../utils/SpriteExtent";
import { Resources } from "../resources/Resources";

/**
 * Reader for versions 7.55 - 7.72
 */
export class MetadataReader3 extends MetadataReader {
    constructor(bytes: ByteArray) {
        super(bytes);
    }

    public readProperties(type: ThingType): boolean {
        let flag = 0;
        while (flag < MetadataFlags3.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();

            if (flag === MetadataFlags3.LAST_FLAG) {
                return true;
            }

            switch (flag) {
                case MetadataFlags3.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;

                case MetadataFlags3.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;

                case MetadataFlags3.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;

                case MetadataFlags3.ON_TOP:
                    type.isOnTop = true;
                    break;

                case MetadataFlags3.CONTAINER:
                    type.isContainer = true;
                    break;

                case MetadataFlags3.STACKABLE:
                    type.stackable = true;
                    break;

                case MetadataFlags3.MULTI_USE:
                    type.multiUse = true;
                    break;

                case MetadataFlags3.FORCE_USE:
                    type.forceUse = true;
                    break;

                case MetadataFlags3.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags3.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags3.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;

                case MetadataFlags3.FLUID:
                    type.isFluid = true;
                    break;

                case MetadataFlags3.UNPASSABLE:
                    type.isUnpassable = true;
                    break;

                case MetadataFlags3.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;

                case MetadataFlags3.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;

                case MetadataFlags3.BLOCK_PATHFINDER:
                    type.blockPathfind = true;
                    break;

                case MetadataFlags3.PICKUPABLE:
                    type.pickupable = true;
                    break;

                case MetadataFlags3.HANGABLE:
                    type.hangable = true;
                    break;

                case MetadataFlags3.VERTICAL:
                    type.isVertical = true;
                    break;

                case MetadataFlags3.HORIZONTAL:
                    type.isHorizontal = true;
                    break;

                case MetadataFlags3.ROTATABLE:
                    type.rotatable = true;
                    break;

                case MetadataFlags3.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;

                case MetadataFlags3.FLOOR_CHANGE:
                    type.floorChange = true;
                    break;

                case MetadataFlags3.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;

                case MetadataFlags3.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;

                case MetadataFlags3.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;

                case MetadataFlags3.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;

                case MetadataFlags3.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;

                case MetadataFlags3.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;

                case MetadataFlags3.FULL_GROUND:
                    type.isFullGround = true;
                    break;

                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${type.category}, id: ${type.id})`);
            }
        }

        return true;
    }

    public readTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory.OUTFIT) {
            groupCount = this.readUnsignedByte();
        }

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory.OUTFIT) {
                this.readUnsignedByte(); // Skip group type
            }

            const frameGroup = new FrameGroup();
            frameGroup.type = groupType;
            frameGroup.width = this.readUnsignedByte();
            frameGroup.height = this.readUnsignedByte();

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = this.readUnsignedByte();
            } else {
                frameGroup.exactSize = SpriteExtent.DEFAULT_SIZE;
            }

            frameGroup.layers = this.readUnsignedByte();
            frameGroup.patternX = this.readUnsignedByte();
            frameGroup.patternY = this.readUnsignedByte();
            frameGroup.patternZ = this.readUnsignedByte(); // Version 3 supports patternZ
            frameGroup.frames = this.readUnsignedByte();

            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.frameDurations = new Array<FrameDuration>(frameGroup.frames);

                if (frameDurations && this.settings) {
                    frameGroup.animationMode = this.readUnsignedByte();
                    frameGroup.loopCount = this.readInt();
                    frameGroup.startFrame = this.readByte();

                    for (let i = 0; i < frameGroup.frames; i++) {
                        const minimum = this.readUnsignedInt();
                        const maximum = this.readUnsignedInt();
                        frameGroup.frameDurations![i] = new FrameDuration(minimum, maximum);
                    }
                } else if (this.settings) {
                    const duration = this.settings.getDefaultDuration(type.category);
                    for (let i = 0; i < frameGroup.frames; i++) {
                        frameGroup.frameDurations![i] = new FrameDuration(duration, duration);
                    }
                }
            }

            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`A thing type has more than ${SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }

            frameGroup.spriteIndex = new Array<number>(totalSprites);
            for (let i = 0; i < totalSprites; i++) {
                if (extended) {
                    frameGroup.spriteIndex[i] = this.readUnsignedInt();
                } else {
                    frameGroup.spriteIndex[i] = this.readUnsignedShort();
                }
            }

            type.setFrameGroup(groupType, frameGroup);
        }

        return true;
    }
}


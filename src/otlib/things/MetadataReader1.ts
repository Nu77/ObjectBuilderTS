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
import { MetadataFlags1 } from "./MetadataFlags1";
import { SpriteExtent } from "../utils/SpriteExtent";
import { Resources } from "../resources/Resources";

/**
 * Reader for versions 7.10 - 7.30
 */
export class MetadataReader1 extends MetadataReader {
    constructor(bytes: ByteArray) {
        super(bytes);
    }

    public readProperties(type: ThingType): boolean {
        let flag = 0;
        while (flag < MetadataFlags1.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();

            if (flag === MetadataFlags1.LAST_FLAG) {
                return true;
            }

            switch (flag) {
                case MetadataFlags1.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;

                case MetadataFlags1.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;

                case MetadataFlags1.ON_TOP:
                    type.isOnTop = true;
                    break;

                case MetadataFlags1.CONTAINER:
                    type.isContainer = true;
                    break;

                case MetadataFlags1.STACKABLE:
                    type.stackable = true;
                    break;

                case MetadataFlags1.MULTI_USE:
                    type.multiUse = true;
                    break;

                case MetadataFlags1.FORCE_USE:
                    type.forceUse = true;
                    break;

                case MetadataFlags1.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags1.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags1.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;

                case MetadataFlags1.FLUID:
                    type.isFluid = true;
                    break;

                case MetadataFlags1.UNPASSABLE:
                    type.isUnpassable = true;
                    break;

                case MetadataFlags1.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;

                case MetadataFlags1.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;

                case MetadataFlags1.BLOCK_PATHFINDER:
                    type.blockPathfind = true;
                    break;

                case MetadataFlags1.PICKUPABLE:
                    type.pickupable = true;
                    break;

                case MetadataFlags1.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;

                case MetadataFlags1.FLOOR_CHANGE:
                    type.floorChange = true;
                    break;

                case MetadataFlags1.FULL_GROUND:
                    type.isFullGround = true;
                    break;

                case MetadataFlags1.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;

                case MetadataFlags1.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = 8;
                    type.offsetY = 8;
                    break;

                case MetadataFlags1.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;

                case MetadataFlags1.ROTATABLE:
                    type.rotatable = true;
                    break;

                case MetadataFlags1.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;

                case MetadataFlags1.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;

                case MetadataFlags1.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;

                case MetadataFlags1.WRAPPABLE:
                    type.wrappable = true;
                    break;

                case MetadataFlags1.UNWRAPPABLE:
                    type.unwrappable = true;
                    break;

                case MetadataFlags1.TOP_EFFECT:
                    type.topEffect = true;
                    break;

                default:
                    throw new Error(Resources.getString("readUnknownFlag",
                        flag.toString(16),
                        previousFlag.toString(16),
                        Resources.getString(type.category),
                        type.id.toString()));
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
                this.readUnsignedByte();
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
            frameGroup.patternZ = 1;
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


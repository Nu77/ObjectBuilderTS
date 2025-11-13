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

import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { MetadataWriter } from "./MetadataWriter";
import { MetadataFlags2 } from "./MetadataFlags2";
import { FrameGroup } from "../animation/FrameGroup";

/**
 * Writer for versions 7.40 - 7.50
 */
export class MetadataWriter2 extends MetadataWriter {
    constructor() {
        super();
    }

    public writeProperties(type: ThingType): boolean {
        if (type.category === ThingCategory.ITEM) {
            return false;
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags2.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags2.HAS_OFFSET);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags2.ANIMATE_ALWAYS);
        }

        this.writeByte(MetadataFlags2.LAST_FLAG);
        return true;
    }

    public writeItemProperties(type: ThingType): boolean {
        if (type.category !== ThingCategory.ITEM) {
            return false;
        }

        if (type.isGround) {
            this.writeByte(MetadataFlags2.GROUND);
            this.writeShort(type.groundSpeed);
        } else if (type.isOnBottom) {
            this.writeByte(MetadataFlags2.ON_BOTTOM);
        } else if (type.isOnTop) {
            this.writeByte(MetadataFlags2.ON_TOP);
        }

        if (type.isContainer) {
            this.writeByte(MetadataFlags2.CONTAINER);
        }

        if (type.stackable) {
            this.writeByte(MetadataFlags2.STACKABLE);
        }

        if (type.multiUse) {
            this.writeByte(MetadataFlags2.MULTI_USE);
        }

        if (type.forceUse) {
            this.writeByte(MetadataFlags2.FORCE_USE);
        }

        if (type.writable) {
            this.writeByte(MetadataFlags2.WRITABLE);
            this.writeShort(type.maxTextLength);
        }

        if (type.writableOnce) {
            this.writeByte(MetadataFlags2.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }

        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags2.FLUID_CONTAINER);
        }

        if (type.isFluid) {
            this.writeByte(MetadataFlags2.FLUID);
        }

        if (type.isUnpassable) {
            this.writeByte(MetadataFlags2.UNPASSABLE);
        }

        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags2.UNMOVEABLE);
        }

        if (type.blockMissile) {
            this.writeByte(MetadataFlags2.BLOCK_MISSILE);
        }

        if (type.blockPathfind) {
            this.writeByte(MetadataFlags2.BLOCK_PATHFINDER);
        }

        if (type.pickupable) {
            this.writeByte(MetadataFlags2.PICKUPABLE);
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags2.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.floorChange) {
            this.writeByte(MetadataFlags2.FLOOR_CHANGE);
        }

        if (type.isFullGround) {
            this.writeByte(MetadataFlags2.FULL_GROUND);
        }

        if (type.hasElevation) {
            this.writeByte(MetadataFlags2.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags2.HAS_OFFSET);
        }

        if (type.miniMap) {
            this.writeByte(MetadataFlags2.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }

        if (type.rotatable) {
            this.writeByte(MetadataFlags2.ROTATABLE);
        }

        if (type.isLyingObject) {
            this.writeByte(MetadataFlags2.LYING_OBJECT);
        }

        if (type.hangable) {
            this.writeByte(MetadataFlags2.HANGABLE);
        }

        if (type.isVertical) {
            this.writeByte(MetadataFlags2.VERTICAL);
        }

        if (type.isHorizontal) {
            this.writeByte(MetadataFlags2.HORIZONTAL);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags2.ANIMATE_ALWAYS);
        }

        if (type.topEffect && type.category === ThingCategory.EFFECT) {
            this.writeByte(MetadataFlags2.TOP_EFFECT);
        }

        if (type.isLensHelp) {
            this.writeByte(MetadataFlags2.LENS_HELP);
            this.writeShort(type.lensHelp);
        }

        if (type.wrappable) {
            this.writeByte(MetadataFlags2.WRAPPABLE);
        }

        if (type.unwrappable) {
            this.writeByte(MetadataFlags2.UNWRAPPABLE);
        }

        this.writeByte(MetadataFlags2.LAST_FLAG);

        return true;
    }

    public writeTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory.OUTFIT) {
            groupCount = type.frameGroups.filter(g => g !== null).length;
            this.writeByte(groupCount);
        }

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory.OUTFIT) {
                let group = groupType;
                if (groupCount < 2) {
                    group = 1;
                }
                this.writeByte(group);
            }

            const frameGroup = type.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }

            this.writeByte(frameGroup.width);  // Write width
            this.writeByte(frameGroup.height); // Write height

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                this.writeByte(frameGroup.exactSize); // Write exact size
            }

            this.writeByte(frameGroup.layers);   // Write layers
            this.writeByte(frameGroup.patternX); // Write pattern X
            this.writeByte(frameGroup.patternY); // Write pattern Y
            this.writeByte(frameGroup.frames);   // Write frames

            if (frameDurations && frameGroup.isAnimation && frameGroup.frameDurations) {
                this.writeByte(frameGroup.animationMode);   // Write animation type
                this.writeInt(frameGroup.loopCount);        // Write loop count
                this.writeByte(frameGroup.startFrame);      // Write start frame

                for (let i = 0; i < frameGroup.frames; i++) {
                    const duration = frameGroup.frameDurations[i];
                    this.writeUnsignedInt(duration.minimum); // Write minimum duration
                    this.writeUnsignedInt(duration.maximum); // Write maximum duration
                }
            }

            const spriteIndex = frameGroup.spriteIndex;
            if (spriteIndex) {
                const length = spriteIndex.length;
                for (let i = 0; i < length; i++) {
                    // Write sprite index
                    if (extended) {
                        this.writeUnsignedInt(spriteIndex[i]);
                    } else {
                        this.writeShort(spriteIndex[i]);
                    }
                }
            }
        }

        return true;
    }
}


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
import { ThingType } from "./ThingType";
import { MetadataReader } from "./MetadataReader";
import { MetadataFlags5 } from "./MetadataFlags5";
import { Resources } from "../resources/Resources";

/**
 * Reader for versions 8.60 - 9.86
 */
export class MetadataReader5 extends MetadataReader {
    constructor(bytes: ByteArray) {
        super(bytes);
    }

    public readProperties(type: ThingType): boolean {
        let flag = 0;

        while (flag < MetadataFlags5.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();

            if (flag === MetadataFlags5.LAST_FLAG) {
                return true;
            }

            switch (flag) {
                case MetadataFlags5.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;

                case MetadataFlags5.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;

                case MetadataFlags5.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;

                case MetadataFlags5.ON_TOP:
                    type.isOnTop = true;
                    break;

                case MetadataFlags5.CONTAINER:
                    type.isContainer = true;
                    break;

                case MetadataFlags5.STACKABLE:
                    type.stackable = true;
                    break;

                case MetadataFlags5.FORCE_USE:
                    type.forceUse = true;
                    break;

                case MetadataFlags5.MULTI_USE:
                    type.multiUse = true;
                    break;

                case MetadataFlags5.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags5.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags5.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;

                case MetadataFlags5.FLUID:
                    type.isFluid = true;
                    break;

                case MetadataFlags5.UNPASSABLE:
                    type.isUnpassable = true;
                    break;

                case MetadataFlags5.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;

                case MetadataFlags5.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;

                case MetadataFlags5.BLOCK_PATHFIND:
                    type.blockPathfind = true;
                    break;

                case MetadataFlags5.PICKUPABLE:
                    type.pickupable = true;
                    break;

                case MetadataFlags5.HANGABLE:
                    type.hangable = true;
                    break;

                case MetadataFlags5.VERTICAL:
                    type.isVertical = true;
                    break;

                case MetadataFlags5.HORIZONTAL:
                    type.isHorizontal = true;
                    break;

                case MetadataFlags5.ROTATABLE:
                    type.rotatable = true;
                    break;

                case MetadataFlags5.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;

                case MetadataFlags5.DONT_HIDE:
                    type.dontHide = true;
                    break;

                case MetadataFlags5.TRANSLUCENT:
                    type.isTranslucent = true;
                    break;

                case MetadataFlags5.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;

                case MetadataFlags5.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;

                case MetadataFlags5.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;

                case MetadataFlags5.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;

                case MetadataFlags5.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;

                case MetadataFlags5.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;

                case MetadataFlags5.FULL_GROUND:
                    type.isFullGround = true;
                    break;

                case MetadataFlags5.IGNORE_LOOK:
                    type.ignoreLook = true;
                    break;

                case MetadataFlags5.CLOTH:
                    type.cloth = true;
                    type.clothSlot = this.readUnsignedShort();
                    break;

                case MetadataFlags5.MARKET_ITEM:
                    type.isMarketItem = true;
                    type.marketCategory = this.readUnsignedShort();
                    type.marketTradeAs = this.readUnsignedShort();
                    type.marketShowAs = this.readUnsignedShort();
                    const nameLength = this.readUnsignedShort();
                    type.marketName = this._bytes.readMultiByte(nameLength, MetadataFlags5.STRING_CHARSET);
                    type.marketRestrictProfession = this.readUnsignedShort();
                    type.marketRestrictLevel = this.readUnsignedShort();
                    break;

                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${type.category}, id: ${type.id})`);
            }
        }

        return true;
    }
}


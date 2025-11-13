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
import { MetadataFlags5 } from "./MetadataFlags5";

/**
 * Writer for versions 8.60 - 9.86
 */
export class MetadataWriter5 extends MetadataWriter {
    constructor() {
        super();
    }

    public writeProperties(type: ThingType): boolean {
        if (type.category === ThingCategory.ITEM) {
            return false;
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags5.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags5.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags5.ANIMATE_ALWAYS);
        }

        this.writeByte(MetadataFlags5.LAST_FLAG);
        return true;
    }

    public writeItemProperties(type: ThingType): boolean {
        if (type.category !== ThingCategory.ITEM) {
            return false;
        }

        if (type.isGround) {
            this.writeByte(MetadataFlags5.GROUND);
            this.writeShort(type.groundSpeed);
        } else if (type.isGroundBorder) {
            this.writeByte(MetadataFlags5.GROUND_BORDER);
        } else if (type.isOnBottom) {
            this.writeByte(MetadataFlags5.ON_BOTTOM);
        } else if (type.isOnTop) {
            this.writeByte(MetadataFlags5.ON_TOP);
        }

        if (type.isContainer) {
            this.writeByte(MetadataFlags5.CONTAINER);
        }

        if (type.stackable) {
            this.writeByte(MetadataFlags5.STACKABLE);
        }

        if (type.forceUse) {
            this.writeByte(MetadataFlags5.FORCE_USE);
        }

        if (type.multiUse) {
            this.writeByte(MetadataFlags5.MULTI_USE);
        }

        if (type.writable) {
            this.writeByte(MetadataFlags5.WRITABLE);
            this.writeShort(type.maxTextLength);
        }

        if (type.writableOnce) {
            this.writeByte(MetadataFlags5.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }

        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags5.FLUID_CONTAINER);
        }

        if (type.isFluid) {
            this.writeByte(MetadataFlags5.FLUID);
        }

        if (type.isUnpassable) {
            this.writeByte(MetadataFlags5.UNPASSABLE);
        }

        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags5.UNMOVEABLE);
        }

        if (type.blockMissile) {
            this.writeByte(MetadataFlags5.BLOCK_MISSILE);
        }

        if (type.blockPathfind) {
            this.writeByte(MetadataFlags5.BLOCK_PATHFIND);
        }

        if (type.pickupable) {
            this.writeByte(MetadataFlags5.PICKUPABLE);
        }

        if (type.hangable) {
            this.writeByte(MetadataFlags5.HANGABLE);
        }

        if (type.isVertical) {
            this.writeByte(MetadataFlags5.VERTICAL);
        }

        if (type.isHorizontal) {
            this.writeByte(MetadataFlags5.HORIZONTAL);
        }

        if (type.rotatable) {
            this.writeByte(MetadataFlags5.ROTATABLE);
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags5.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.dontHide) {
            this.writeByte(MetadataFlags5.DONT_HIDE);
        }

        if (type.isTranslucent) {
            this.writeByte(MetadataFlags5.TRANSLUCENT);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags5.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.hasElevation) {
            this.writeByte(MetadataFlags5.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }

        if (type.isLyingObject) {
            this.writeByte(MetadataFlags5.LYING_OBJECT);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags5.ANIMATE_ALWAYS);
        }

        if (type.miniMap) {
            this.writeByte(MetadataFlags5.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }

        if (type.isLensHelp) {
            this.writeByte(MetadataFlags5.LENS_HELP);
            this.writeShort(type.lensHelp);
        }

        if (type.isFullGround) {
            this.writeByte(MetadataFlags5.FULL_GROUND);
        }

        if (type.ignoreLook) {
            this.writeByte(MetadataFlags5.IGNORE_LOOK);
        }

        if (type.cloth) {
            this.writeByte(MetadataFlags5.CLOTH);
            this.writeShort(type.clothSlot);
        }

        if (type.isMarketItem) {
            this.writeByte(MetadataFlags5.MARKET_ITEM);
            this.writeShort(type.marketCategory);
            this.writeShort(type.marketTradeAs);
            this.writeShort(type.marketShowAs);
            this.writeShort(type.marketName.length);
            this._bytes.writeMultiByte(type.marketName, MetadataFlags5.STRING_CHARSET);
            this.writeShort(type.marketRestrictProfession);
            this.writeShort(type.marketRestrictLevel);
        }

        this.writeByte(MetadataFlags5.LAST_FLAG);

        return true;
    }
}


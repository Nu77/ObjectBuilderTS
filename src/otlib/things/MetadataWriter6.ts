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
import { MetadataFlags6 } from "./MetadataFlags6";

/**
 * Writer for versions 10.10 - 10.56
 */
export class MetadataWriter6 extends MetadataWriter {
    constructor() {
        super();
    }

    public writeProperties(type: ThingType): boolean {
        if (type.category === ThingCategory.ITEM) {
            return false;
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags6.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags6.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags6.ANIMATE_ALWAYS);
        }

        if (type.topEffect && type.category === ThingCategory.EFFECT) {
            this.writeByte(MetadataFlags6.TOP_EFFECT);
        }

        this.writeByte(MetadataFlags6.LAST_FLAG);
        return true;
    }

    public writeItemProperties(type: ThingType): boolean {
        if (type.category !== ThingCategory.ITEM) {
            return false;
        }

        if (type.isGround) {
            this.writeByte(MetadataFlags6.GROUND);
            this.writeShort(type.groundSpeed);
        } else if (type.isGroundBorder) {
            this.writeByte(MetadataFlags6.GROUND_BORDER);
        } else if (type.isOnBottom) {
            this.writeByte(MetadataFlags6.ON_BOTTOM);
        } else if (type.isOnTop) {
            this.writeByte(MetadataFlags6.ON_TOP);
        }

        if (type.isContainer) {
            this.writeByte(MetadataFlags6.CONTAINER);
        }

        if (type.stackable) {
            this.writeByte(MetadataFlags6.STACKABLE);
        }

        if (type.forceUse) {
            this.writeByte(MetadataFlags6.FORCE_USE);
        }

        if (type.multiUse) {
            this.writeByte(MetadataFlags6.MULTI_USE);
        }

        if (type.writable) {
            this.writeByte(MetadataFlags6.WRITABLE);
            this.writeShort(type.maxTextLength);
        }

        if (type.writableOnce) {
            this.writeByte(MetadataFlags6.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }

        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags6.FLUID_CONTAINER);
        }

        if (type.isFluid) {
            this.writeByte(MetadataFlags6.FLUID);
        }

        if (type.isUnpassable) {
            this.writeByte(MetadataFlags6.UNPASSABLE);
        }

        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags6.UNMOVEABLE);
        }

        if (type.blockMissile) {
            this.writeByte(MetadataFlags6.BLOCK_MISSILE);
        }

        if (type.blockPathfind) {
            this.writeByte(MetadataFlags6.BLOCK_PATHFIND);
        }

        if (type.noMoveAnimation) {
            this.writeByte(MetadataFlags6.NO_MOVE_ANIMATION);
        }

        if (type.pickupable) {
            this.writeByte(MetadataFlags6.PICKUPABLE);
        }

        if (type.hangable) {
            this.writeByte(MetadataFlags6.HANGABLE);
        }

        if (type.isVertical) {
            this.writeByte(MetadataFlags6.VERTICAL);
        }

        if (type.isHorizontal) {
            this.writeByte(MetadataFlags6.HORIZONTAL);
        }

        if (type.rotatable) {
            this.writeByte(MetadataFlags6.ROTATABLE);
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags6.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.dontHide) {
            this.writeByte(MetadataFlags6.DONT_HIDE);
        }

        if (type.isTranslucent) {
            this.writeByte(MetadataFlags6.TRANSLUCENT);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags6.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.hasElevation) {
            this.writeByte(MetadataFlags6.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }

        if (type.isLyingObject) {
            this.writeByte(MetadataFlags6.LYING_OBJECT);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags6.ANIMATE_ALWAYS);
        }

        if (type.miniMap) {
            this.writeByte(MetadataFlags6.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }

        if (type.isLensHelp) {
            this.writeByte(MetadataFlags6.LENS_HELP);
            this.writeShort(type.lensHelp);
        }

        if (type.isFullGround) {
            this.writeByte(MetadataFlags6.FULL_GROUND);
        }

        if (type.ignoreLook) {
            this.writeByte(MetadataFlags6.IGNORE_LOOK);
        }

        if (type.cloth) {
            this.writeByte(MetadataFlags6.CLOTH);
            this.writeShort(type.clothSlot);
        }

        if (type.isMarketItem) {
            this.writeByte(MetadataFlags6.MARKET_ITEM);
            this.writeShort(type.marketCategory);
            this.writeShort(type.marketTradeAs);
            this.writeShort(type.marketShowAs);
            this.writeShort(type.marketName.length);
            this._bytes.writeMultiByte(type.marketName, MetadataFlags6.STRING_CHARSET);
            this.writeShort(type.marketRestrictProfession);
            this.writeShort(type.marketRestrictLevel);
        }

        if (type.hasDefaultAction) {
            this.writeByte(MetadataFlags6.DEFAULT_ACTION);
            this.writeShort(type.defaultAction);
        }

        if (type.wrappable) {
            this.writeByte(MetadataFlags6.WRAPPABLE);
        }

        if (type.unwrappable) {
            this.writeByte(MetadataFlags6.UNWRAPPABLE);
        }

        if (type.usable) {
            this.writeByte(MetadataFlags6.USABLE);
        }

        this.writeByte(MetadataFlags6.LAST_FLAG);

        return true;
    }
}


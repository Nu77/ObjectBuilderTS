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
exports.MetadataWriter4 = void 0;
const ThingCategory_1 = require("./ThingCategory");
const MetadataWriter_1 = require("./MetadataWriter");
const MetadataFlags4_1 = require("./MetadataFlags4");
/**
 * Writer for versions 7.80 - 8.54
 */
class MetadataWriter4 extends MetadataWriter_1.MetadataWriter {
    constructor() {
        super();
    }
    writeProperties(type) {
        if (type.category === ThingCategory_1.ThingCategory.ITEM) {
            return false;
        }
        if (type.hasLight) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }
        if (type.hasOffset) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }
        if (type.animateAlways) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.ANIMATE_ALWAYS);
        }
        this.writeByte(MetadataFlags4_1.MetadataFlags4.LAST_FLAG);
        return true;
    }
    writeItemProperties(type) {
        if (type.category !== ThingCategory_1.ThingCategory.ITEM) {
            return false;
        }
        if (type.isGround) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.GROUND);
            this.writeShort(type.groundSpeed);
        }
        else if (type.isGroundBorder) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.GROUND_BORDER);
        }
        else if (type.isOnBottom) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.ON_BOTTOM);
        }
        else if (type.isOnTop) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.ON_TOP);
        }
        if (type.isContainer) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.CONTAINER);
        }
        if (type.stackable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.STACKABLE);
        }
        if (type.forceUse) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.FORCE_USE);
        }
        if (type.multiUse) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.MULTI_USE);
        }
        if (type.hasCharges) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_CHARGES);
        }
        if (type.writable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.WRITABLE);
            this.writeShort(type.maxTextLength);
        }
        if (type.writableOnce) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }
        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.FLUID_CONTAINER);
        }
        if (type.isFluid) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.FLUID);
        }
        if (type.isUnpassable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.UNPASSABLE);
        }
        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.UNMOVEABLE);
        }
        if (type.blockMissile) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.BLOCK_MISSILE);
        }
        if (type.blockPathfind) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.BLOCK_PATHFIND);
        }
        if (type.pickupable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.PICKUPABLE);
        }
        if (type.hangable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HANGABLE);
        }
        if (type.isVertical) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.VERTICAL);
        }
        if (type.isHorizontal) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HORIZONTAL);
        }
        if (type.rotatable) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.ROTATABLE);
        }
        if (type.hasLight) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }
        if (type.dontHide) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.DONT_HIDE);
        }
        if (type.floorChange) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.FLOOR_CHANGE);
        }
        if (type.hasOffset) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }
        if (type.hasElevation) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }
        if (type.isLyingObject) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.LYING_OBJECT);
        }
        if (type.animateAlways) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.ANIMATE_ALWAYS);
        }
        if (type.miniMap) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }
        if (type.isLensHelp) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.LENS_HELP);
            this.writeShort(type.lensHelp);
        }
        if (type.isFullGround) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.FULL_GROUND);
        }
        if (type.ignoreLook) {
            this.writeByte(MetadataFlags4_1.MetadataFlags4.IGNORE_LOOK);
        }
        this.writeByte(MetadataFlags4_1.MetadataFlags4.LAST_FLAG);
        return true;
    }
}
exports.MetadataWriter4 = MetadataWriter4;

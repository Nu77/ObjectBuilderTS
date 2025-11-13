"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataWriter5 = void 0;
const ThingCategory_1 = require("./ThingCategory");
const MetadataWriter_1 = require("./MetadataWriter");
const MetadataFlags5_1 = require("./MetadataFlags5");
/**
 * Writer for versions 8.60 - 9.86
 */
class MetadataWriter5 extends MetadataWriter_1.MetadataWriter {
    constructor() {
        super();
    }
    writeProperties(type) {
        if (type.category === ThingCategory_1.ThingCategory.ITEM) {
            return false;
        }
        if (type.hasLight) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }
        if (type.hasOffset) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }
        if (type.animateAlways) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.ANIMATE_ALWAYS);
        }
        this.writeByte(MetadataFlags5_1.MetadataFlags5.LAST_FLAG);
        return true;
    }
    writeItemProperties(type) {
        if (type.category !== ThingCategory_1.ThingCategory.ITEM) {
            return false;
        }
        if (type.isGround) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.GROUND);
            this.writeShort(type.groundSpeed);
        }
        else if (type.isGroundBorder) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.GROUND_BORDER);
        }
        else if (type.isOnBottom) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.ON_BOTTOM);
        }
        else if (type.isOnTop) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.ON_TOP);
        }
        if (type.isContainer) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.CONTAINER);
        }
        if (type.stackable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.STACKABLE);
        }
        if (type.forceUse) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.FORCE_USE);
        }
        if (type.multiUse) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.MULTI_USE);
        }
        if (type.writable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.WRITABLE);
            this.writeShort(type.maxTextLength);
        }
        if (type.writableOnce) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }
        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.FLUID_CONTAINER);
        }
        if (type.isFluid) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.FLUID);
        }
        if (type.isUnpassable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.UNPASSABLE);
        }
        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.UNMOVEABLE);
        }
        if (type.blockMissile) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.BLOCK_MISSILE);
        }
        if (type.blockPathfind) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.BLOCK_PATHFIND);
        }
        if (type.pickupable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.PICKUPABLE);
        }
        if (type.hangable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HANGABLE);
        }
        if (type.isVertical) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.VERTICAL);
        }
        if (type.isHorizontal) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HORIZONTAL);
        }
        if (type.rotatable) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.ROTATABLE);
        }
        if (type.hasLight) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }
        if (type.dontHide) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.DONT_HIDE);
        }
        if (type.isTranslucent) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.TRANSLUCENT);
        }
        if (type.hasOffset) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }
        if (type.hasElevation) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }
        if (type.isLyingObject) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.LYING_OBJECT);
        }
        if (type.animateAlways) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.ANIMATE_ALWAYS);
        }
        if (type.miniMap) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }
        if (type.isLensHelp) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.LENS_HELP);
            this.writeShort(type.lensHelp);
        }
        if (type.isFullGround) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.FULL_GROUND);
        }
        if (type.ignoreLook) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.IGNORE_LOOK);
        }
        if (type.cloth) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.CLOTH);
            this.writeShort(type.clothSlot);
        }
        if (type.isMarketItem) {
            this.writeByte(MetadataFlags5_1.MetadataFlags5.MARKET_ITEM);
            this.writeShort(type.marketCategory);
            this.writeShort(type.marketTradeAs);
            this.writeShort(type.marketShowAs);
            this.writeShort(type.marketName.length);
            this._bytes.writeMultiByte(type.marketName, MetadataFlags5_1.MetadataFlags5.STRING_CHARSET);
            this.writeShort(type.marketRestrictProfession);
            this.writeShort(type.marketRestrictLevel);
        }
        this.writeByte(MetadataFlags5_1.MetadataFlags5.LAST_FLAG);
        return true;
    }
}
exports.MetadataWriter5 = MetadataWriter5;

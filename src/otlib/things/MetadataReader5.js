"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataReader5 = void 0;
const MetadataReader_1 = require("./MetadataReader");
const MetadataFlags5_1 = require("./MetadataFlags5");
/**
 * Reader for versions 8.60 - 9.86
 */
class MetadataReader5 extends MetadataReader_1.MetadataReader {
    constructor(bytes) {
        super(bytes);
    }
    readProperties(type) {
        let flag = 0;
        while (flag < MetadataFlags5_1.MetadataFlags5.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();
            if (flag === MetadataFlags5_1.MetadataFlags5.LAST_FLAG) {
                return true;
            }
            switch (flag) {
                case MetadataFlags5_1.MetadataFlags5.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.ON_TOP:
                    type.isOnTop = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.CONTAINER:
                    type.isContainer = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.STACKABLE:
                    type.stackable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.FORCE_USE:
                    type.forceUse = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.MULTI_USE:
                    type.multiUse = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.FLUID:
                    type.isFluid = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.UNPASSABLE:
                    type.isUnpassable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.BLOCK_PATHFIND:
                    type.blockPathfind = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.PICKUPABLE:
                    type.pickupable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.HANGABLE:
                    type.hangable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.VERTICAL:
                    type.isVertical = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.HORIZONTAL:
                    type.isHorizontal = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.ROTATABLE:
                    type.rotatable = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.DONT_HIDE:
                    type.dontHide = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.TRANSLUCENT:
                    type.isTranslucent = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.FULL_GROUND:
                    type.isFullGround = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.IGNORE_LOOK:
                    type.ignoreLook = true;
                    break;
                case MetadataFlags5_1.MetadataFlags5.CLOTH:
                    type.cloth = true;
                    type.clothSlot = this.readUnsignedShort();
                    break;
                case MetadataFlags5_1.MetadataFlags5.MARKET_ITEM:
                    type.isMarketItem = true;
                    type.marketCategory = this.readUnsignedShort();
                    type.marketTradeAs = this.readUnsignedShort();
                    type.marketShowAs = this.readUnsignedShort();
                    const nameLength = this.readUnsignedShort();
                    type.marketName = this._bytes.readMultiByte(nameLength, MetadataFlags5_1.MetadataFlags5.STRING_CHARSET);
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
exports.MetadataReader5 = MetadataReader5;

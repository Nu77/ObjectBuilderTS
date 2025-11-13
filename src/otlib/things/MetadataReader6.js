"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataReader6 = void 0;
const MetadataReader_1 = require("./MetadataReader");
const MetadataFlags6_1 = require("./MetadataFlags6");
/**
 * Reader for versions 10.10 - 10.56
 */
class MetadataReader6 extends MetadataReader_1.MetadataReader {
    constructor(bytes) {
        super(bytes);
    }
    readProperties(type) {
        let flag = 0;
        while (flag < MetadataFlags6_1.MetadataFlags6.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();
            if (flag === MetadataFlags6_1.MetadataFlags6.LAST_FLAG) {
                return true;
            }
            switch (flag) {
                case MetadataFlags6_1.MetadataFlags6.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.ON_TOP:
                    type.isOnTop = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.CONTAINER:
                    type.isContainer = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.STACKABLE:
                    type.stackable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.FORCE_USE:
                    type.forceUse = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.MULTI_USE:
                    type.multiUse = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.FLUID:
                    type.isFluid = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.UNPASSABLE:
                    type.isUnpassable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.BLOCK_PATHFIND:
                    type.blockPathfind = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.NO_MOVE_ANIMATION:
                    type.noMoveAnimation = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.PICKUPABLE:
                    type.pickupable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.HANGABLE:
                    type.hangable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.VERTICAL:
                    type.isVertical = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.HORIZONTAL:
                    type.isHorizontal = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.ROTATABLE:
                    type.rotatable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.DONT_HIDE:
                    type.dontHide = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.TRANSLUCENT:
                    type.isTranslucent = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.FULL_GROUND:
                    type.isFullGround = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.IGNORE_LOOK:
                    type.ignoreLook = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.CLOTH:
                    type.cloth = true;
                    type.clothSlot = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.MARKET_ITEM:
                    type.isMarketItem = true;
                    type.marketCategory = this.readUnsignedShort();
                    type.marketTradeAs = this.readUnsignedShort();
                    type.marketShowAs = this.readUnsignedShort();
                    const nameLength = this.readUnsignedShort();
                    type.marketName = this._bytes.readMultiByte(nameLength, MetadataFlags6_1.MetadataFlags6.STRING_CHARSET);
                    type.marketRestrictProfession = this.readUnsignedShort();
                    type.marketRestrictLevel = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.DEFAULT_ACTION:
                    type.hasDefaultAction = true;
                    type.defaultAction = this.readUnsignedShort();
                    break;
                case MetadataFlags6_1.MetadataFlags6.WRAPPABLE:
                    type.wrappable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.UNWRAPPABLE:
                    type.unwrappable = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.TOP_EFFECT:
                    type.topEffect = true;
                    break;
                case MetadataFlags6_1.MetadataFlags6.USABLE:
                    type.usable = true;
                    break;
                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${type.category}, id: ${type.id})`);
            }
        }
        return true;
    }
}
exports.MetadataReader6 = MetadataReader6;

import { ByteArray } from "../utils/ByteArray";
import { ThingType } from "./ThingType";
import { MetadataReader } from "./MetadataReader";
import { MetadataFlags4 } from "./MetadataFlags4";
import { Resources } from "../resources/Resources";

/**
 * Reader for versions 7.80 - 8.54
 */
export class MetadataReader4 extends MetadataReader {
    constructor(bytes: ByteArray) {
        super(bytes);
    }

    public readProperties(type: ThingType): boolean {
        let flag = 0;
        while (flag < MetadataFlags4.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();

            if (flag === MetadataFlags4.LAST_FLAG) {
                return true;
            }

            switch (flag) {
                case MetadataFlags4.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;

                case MetadataFlags4.GROUND_BORDER:
                    type.isGroundBorder = true;
                    break;

                case MetadataFlags4.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;

                case MetadataFlags4.ON_TOP:
                    type.isOnTop = true;
                    break;

                case MetadataFlags4.CONTAINER:
                    type.isContainer = true;
                    break;

                case MetadataFlags4.STACKABLE:
                    type.stackable = true;
                    break;

                case MetadataFlags4.FORCE_USE:
                    type.forceUse = true;
                    break;

                case MetadataFlags4.MULTI_USE:
                    type.multiUse = true;
                    break;

                case MetadataFlags4.HAS_CHARGES:
                    type.hasCharges = true;
                    break;

                case MetadataFlags4.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags4.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;

                case MetadataFlags4.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;

                case MetadataFlags4.FLUID:
                    type.isFluid = true;
                    break;

                case MetadataFlags4.UNPASSABLE:
                    type.isUnpassable = true;
                    break;

                case MetadataFlags4.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;

                case MetadataFlags4.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;

                case MetadataFlags4.BLOCK_PATHFIND:
                    type.blockPathfind = true;
                    break;

                case MetadataFlags4.PICKUPABLE:
                    type.pickupable = true;
                    break;

                case MetadataFlags4.HANGABLE:
                    type.hangable = true;
                    break;

                case MetadataFlags4.VERTICAL:
                    type.isVertical = true;
                    break;

                case MetadataFlags4.HORIZONTAL:
                    type.isHorizontal = true;
                    break;

                case MetadataFlags4.ROTATABLE:
                    type.rotatable = true;
                    break;

                case MetadataFlags4.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;

                case MetadataFlags4.DONT_HIDE:
                    type.dontHide = true;
                    break;

                case MetadataFlags4.FLOOR_CHANGE:
                    type.floorChange = true;
                    break;

                case MetadataFlags4.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = this.readShort();
                    type.offsetY = this.readShort();
                    break;

                case MetadataFlags4.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;

                case MetadataFlags4.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;

                case MetadataFlags4.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;

                case MetadataFlags4.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;

                case MetadataFlags4.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;

                case MetadataFlags4.FULL_GROUND:
                    type.isFullGround = true;
                    break;

                case MetadataFlags4.IGNORE_LOOK:
                    type.ignoreLook = true;
                    break;

                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${type.category}, id: ${type.id})`);
            }
        }

        return true;
    }
}


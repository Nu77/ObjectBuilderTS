import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { MetadataWriter } from "./MetadataWriter";
import { MetadataFlags4 } from "./MetadataFlags4";

/**
 * Writer for versions 7.80 - 8.54
 */
export class MetadataWriter4 extends MetadataWriter {
    constructor() {
        super();
    }

    public writeProperties(type: ThingType): boolean {
        if (type.category === ThingCategory.ITEM) {
            return false;
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags4.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags4.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags4.ANIMATE_ALWAYS);
        }

        this.writeByte(MetadataFlags4.LAST_FLAG);
        return true;
    }

    public writeItemProperties(type: ThingType): boolean {
        if (type.category !== ThingCategory.ITEM) {
            return false;
        }

        if (type.isGround) {
            this.writeByte(MetadataFlags4.GROUND);
            this.writeShort(type.groundSpeed);
        } else if (type.isGroundBorder) {
            this.writeByte(MetadataFlags4.GROUND_BORDER);
        } else if (type.isOnBottom) {
            this.writeByte(MetadataFlags4.ON_BOTTOM);
        } else if (type.isOnTop) {
            this.writeByte(MetadataFlags4.ON_TOP);
        }

        if (type.isContainer) {
            this.writeByte(MetadataFlags4.CONTAINER);
        }

        if (type.stackable) {
            this.writeByte(MetadataFlags4.STACKABLE);
        }

        if (type.forceUse) {
            this.writeByte(MetadataFlags4.FORCE_USE);
        }

        if (type.multiUse) {
            this.writeByte(MetadataFlags4.MULTI_USE);
        }

        if (type.hasCharges) {
            this.writeByte(MetadataFlags4.HAS_CHARGES);
        }

        if (type.writable) {
            this.writeByte(MetadataFlags4.WRITABLE);
            this.writeShort(type.maxTextLength);
        }

        if (type.writableOnce) {
            this.writeByte(MetadataFlags4.WRITABLE_ONCE);
            this.writeShort(type.maxTextLength);
        }

        if (type.isFluidContainer) {
            this.writeByte(MetadataFlags4.FLUID_CONTAINER);
        }

        if (type.isFluid) {
            this.writeByte(MetadataFlags4.FLUID);
        }

        if (type.isUnpassable) {
            this.writeByte(MetadataFlags4.UNPASSABLE);
        }

        if (type.isUnmoveable) {
            this.writeByte(MetadataFlags4.UNMOVEABLE);
        }

        if (type.blockMissile) {
            this.writeByte(MetadataFlags4.BLOCK_MISSILE);
        }

        if (type.blockPathfind) {
            this.writeByte(MetadataFlags4.BLOCK_PATHFIND);
        }

        if (type.pickupable) {
            this.writeByte(MetadataFlags4.PICKUPABLE);
        }

        if (type.hangable) {
            this.writeByte(MetadataFlags4.HANGABLE);
        }

        if (type.isVertical) {
            this.writeByte(MetadataFlags4.VERTICAL);
        }

        if (type.isHorizontal) {
            this.writeByte(MetadataFlags4.HORIZONTAL);
        }

        if (type.rotatable) {
            this.writeByte(MetadataFlags4.ROTATABLE);
        }

        if (type.hasLight) {
            this.writeByte(MetadataFlags4.HAS_LIGHT);
            this.writeShort(type.lightLevel);
            this.writeShort(type.lightColor);
        }

        if (type.dontHide) {
            this.writeByte(MetadataFlags4.DONT_HIDE);
        }

        if (type.floorChange) {
            this.writeByte(MetadataFlags4.FLOOR_CHANGE);
        }

        if (type.hasOffset) {
            this.writeByte(MetadataFlags4.HAS_OFFSET);
            this.writeShort(type.offsetX);
            this.writeShort(type.offsetY);
        }

        if (type.hasElevation) {
            this.writeByte(MetadataFlags4.HAS_ELEVATION);
            this.writeShort(type.elevation);
        }

        if (type.isLyingObject) {
            this.writeByte(MetadataFlags4.LYING_OBJECT);
        }

        if (type.animateAlways) {
            this.writeByte(MetadataFlags4.ANIMATE_ALWAYS);
        }

        if (type.miniMap) {
            this.writeByte(MetadataFlags4.MINI_MAP);
            this.writeShort(type.miniMapColor);
        }

        if (type.isLensHelp) {
            this.writeByte(MetadataFlags4.LENS_HELP);
            this.writeShort(type.lensHelp);
        }

        if (type.isFullGround) {
            this.writeByte(MetadataFlags4.FULL_GROUND);
        }

        if (type.ignoreLook) {
            this.writeByte(MetadataFlags4.IGNORE_LOOK);
        }

        this.writeByte(MetadataFlags4.LAST_FLAG);

        return true;
    }
}


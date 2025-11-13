"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataFlags1 = void 0;
/**
 * The MetadataFlags1 class defines the valid constant values for the client versions 7.10 - 7.30
 */
class MetadataFlags1 {
    constructor() {
        throw new Error("MetadataFlags1 is a static class and cannot be instantiated");
    }
}
exports.MetadataFlags1 = MetadataFlags1;
MetadataFlags1.GROUND = 0x00;
MetadataFlags1.ON_BOTTOM = 0x01;
MetadataFlags1.ON_TOP = 0x02;
MetadataFlags1.CONTAINER = 0x03;
MetadataFlags1.STACKABLE = 0x04;
MetadataFlags1.MULTI_USE = 0x05;
MetadataFlags1.FORCE_USE = 0x06;
MetadataFlags1.WRITABLE = 0x07;
MetadataFlags1.WRITABLE_ONCE = 0x08;
MetadataFlags1.FLUID_CONTAINER = 0x09;
MetadataFlags1.FLUID = 0x0A;
MetadataFlags1.UNPASSABLE = 0x0B;
MetadataFlags1.UNMOVEABLE = 0x0C;
MetadataFlags1.BLOCK_MISSILE = 0x0D;
MetadataFlags1.BLOCK_PATHFINDER = 0x0E;
MetadataFlags1.PICKUPABLE = 0x0F;
MetadataFlags1.HAS_LIGHT = 0x10;
MetadataFlags1.FLOOR_CHANGE = 0x11;
MetadataFlags1.FULL_GROUND = 0x12;
MetadataFlags1.HAS_ELEVATION = 0x13;
MetadataFlags1.HAS_OFFSET = 0x14;
// Flag 0x15 ????
MetadataFlags1.MINI_MAP = 0x16;
MetadataFlags1.ROTATABLE = 0x17;
MetadataFlags1.LYING_OBJECT = 0x18;
MetadataFlags1.ANIMATE_ALWAYS = 0x19;
MetadataFlags1.LENS_HELP = 0x1A;
MetadataFlags1.WRAPPABLE = 0x24;
MetadataFlags1.UNWRAPPABLE = 0x25;
MetadataFlags1.TOP_EFFECT = 0x26;
MetadataFlags1.LAST_FLAG = 0xFF;

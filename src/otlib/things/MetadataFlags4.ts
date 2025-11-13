/**
 * The MetadataFlags4 class defines the valid constant values for the client versions 7.80 - 8.54
 */
export class MetadataFlags4 {
    private constructor() {
        throw new Error("MetadataFlags4 is a static class and cannot be instantiated");
    }

    public static readonly GROUND: number = 0x00;
    public static readonly GROUND_BORDER: number = 0x01;
    public static readonly ON_BOTTOM: number = 0x02;
    public static readonly ON_TOP: number = 0x03;
    public static readonly CONTAINER: number = 0x04;
    public static readonly STACKABLE: number = 0x05;
    public static readonly FORCE_USE: number = 0x06;
    public static readonly MULTI_USE: number = 0x07;
    public static readonly HAS_CHARGES: number = 0x08;
    public static readonly WRITABLE: number = 0x09;
    public static readonly WRITABLE_ONCE: number = 0x0A;
    public static readonly FLUID_CONTAINER: number = 0x0B;
    public static readonly FLUID: number = 0x0C;
    public static readonly UNPASSABLE: number = 0x0D;
    public static readonly UNMOVEABLE: number = 0x0E;
    public static readonly BLOCK_MISSILE: number = 0x0F;
    public static readonly BLOCK_PATHFIND: number = 0x10;
    public static readonly PICKUPABLE: number = 0x11;
    public static readonly HANGABLE: number = 0x12;
    public static readonly VERTICAL: number = 0x13;
    public static readonly HORIZONTAL: number = 0x14;
    public static readonly ROTATABLE: number = 0x15;
    public static readonly HAS_LIGHT: number = 0x16;
    public static readonly DONT_HIDE: number = 0x17;
    public static readonly FLOOR_CHANGE: number = 0x18;
    public static readonly HAS_OFFSET: number = 0x19;
    public static readonly HAS_ELEVATION: number = 0x1A;
    public static readonly LYING_OBJECT: number = 0x1B;
    public static readonly ANIMATE_ALWAYS: number = 0x1C;
    public static readonly MINI_MAP: number = 0x1D;
    public static readonly LENS_HELP: number = 0x1E;
    public static readonly FULL_GROUND: number = 0x1F;
    public static readonly IGNORE_LOOK: number = 0x20;
    public static readonly LAST_FLAG: number = 0xFF;
}


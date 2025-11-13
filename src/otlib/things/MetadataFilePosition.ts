export class MetadataFilePosition {
    private constructor() {
        throw new Error("MetadataFilePosition is a static class and cannot be instantiated");
    }

    public static readonly SIGNATURE: number = 0;
    public static readonly ITEMS_COUNT: number = 4;
    public static readonly OUTFITS_COUNT: number = 6;
    public static readonly EFFECTS_COUNT: number = 8;
    public static readonly MISSILES_COUNT: number = 10;
}


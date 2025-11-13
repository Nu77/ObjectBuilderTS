export class ProgressBarID {
    public static readonly DEFAULT: string = "default";
    public static readonly METADATA: string = "metadata";
    public static readonly SPRITES: string = "sprites";
    public static readonly FIND: string = "find";
    public static readonly OPTIMIZE: string = "optimize";

    private constructor() {
        throw new Error("ProgressBarID is a static class and cannot be instantiated");
    }
}


export class SpriteFilePosition {
    private constructor() {
        throw new Error("SpriteFilePosition is a static class and cannot be instantiated");
    }

    public static readonly SIGNATURE: number = 0;
    public static readonly LENGTH: number = 4;
}


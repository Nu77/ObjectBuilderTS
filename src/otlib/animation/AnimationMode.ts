export class AnimationMode {
    public static readonly ASYNCHRONOUS: number = 0;
    public static readonly SYNCHRONOUS: number = 1;

    private constructor() {
        throw new Error("AnimationMode is a static class and cannot be instantiated");
    }
}


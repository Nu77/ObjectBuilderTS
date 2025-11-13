import { SpriteFilePosition } from "./SpriteFilePosition";

export class SpriteFileSize {
    private constructor() {
        throw new Error("SpriteFileSize is a static class and cannot be instantiated");
    }

    /** The size for header without extended option enabled. **/
    public static readonly HEADER_U16: number = SpriteFilePosition.LENGTH + 2;

    /** The size for header with extended option enabled. **/
    public static readonly HEADER_U32: number = SpriteFilePosition.LENGTH + 4;

    /** The size of sprite address in bytes. **/
    public static readonly ADDRESS: number = 4;
}


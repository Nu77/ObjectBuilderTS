import { Sprite } from "./Sprite";

export interface ISpriteReader {
    readSignature(): number;
    readSpriteCount(): number;
    readSprite(id: number): Sprite | null;
    isEmptySprite(id: number): boolean;
    readonly bytesAvailable: number;
}


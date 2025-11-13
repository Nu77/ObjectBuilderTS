import { ThingType } from "./ThingType";

export interface IMetadataWriter {
    writeByte(value: number): void;
    writeShort(value: number): void;
    writeUnsignedShort(value: number): void;
    writeUnsignedInt(value: number): void;
    writeInt(value: number): void;

    writeProperties(type: ThingType): boolean;
    writeItemProperties(type: ThingType): boolean;
    writeTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean;

    toBuffer(): Buffer;
}


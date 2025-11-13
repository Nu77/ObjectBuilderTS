import { ThingType } from "./ThingType";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";

export interface IMetadataReader {
    readonly settings: ObjectBuilderSettings | null;
    setSettings(value: ObjectBuilderSettings): void;

    readonly bytesAvailable: number;
    position: number;

    readUnsignedByte(): number;
    readByte(): number;
    readUnsignedShort(): number;
    readShort(): number;
    readUnsignedInt(): number;
    readInt(): number;

    readSignature(): number;
    readItemsCount(): number;
    readOutfitsCount(): number;
    readEffectsCount(): number;
    readMissilesCount(): number;
    readProperties(type: ThingType): boolean;
    readTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean;
}


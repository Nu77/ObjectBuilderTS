import * as fs from "fs";
import { ByteArray } from "../utils/ByteArray";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameDuration } from "../animation/FrameDuration";
import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { MetadataFilePosition } from "./MetadataFilePosition";
import { SpriteExtent } from "../utils/SpriteExtent";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";
import { IMetadataReader } from "./IMetadataReader";

export abstract class MetadataReader implements IMetadataReader {
    protected _bytes: ByteArray;
    private _settings: ObjectBuilderSettings | null = null;

    public get settings(): ObjectBuilderSettings | null { return this._settings; }
    public setSettings(value: ObjectBuilderSettings): void {
        if (this._settings !== value) {
            this._settings = value;
        }
    }

    public get bytesAvailable(): number { return this._bytes.bytesAvailable; }
    public get position(): number { return this._bytes.position; }
    public set position(value: number) { this._bytes.position = value; }

    constructor(bytes: ByteArray) {
        this._bytes = bytes;
    }

    public readUnsignedByte(): number { return this._bytes.readUnsignedByte(); }
    public readByte(): number { return this._bytes.readUnsignedByte(); } // TODO: Implement signed byte
    public readUnsignedShort(): number { return this._bytes.readUnsignedShort(); }
    public readShort(): number { return this._bytes.readUnsignedShort(); } // TODO: Implement signed short
    public readUnsignedInt(): number { return this._bytes.readUnsignedInt(); }
    public readInt(): number { return this._bytes.readUnsignedInt(); } // TODO: Implement signed int

    public readSignature(): number {
        this.position = MetadataFilePosition.SIGNATURE;
        return this.readUnsignedInt();
    }

    public readItemsCount(): number {
        this.position = MetadataFilePosition.ITEMS_COUNT;
        return this.readUnsignedShort();
    }

    public readOutfitsCount(): number {
        this.position = MetadataFilePosition.OUTFITS_COUNT;
        return this.readUnsignedShort();
    }

    public readEffectsCount(): number {
        this.position = MetadataFilePosition.EFFECTS_COUNT;
        return this.readUnsignedShort();
    }

    public readMissilesCount(): number {
        this.position = MetadataFilePosition.MISSILES_COUNT;
        return this.readUnsignedShort();
    }

    public abstract readProperties(type: ThingType): boolean;

    public readTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory.OUTFIT) {
            groupCount = this.readUnsignedByte();
        }

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory.OUTFIT) {
                this.readUnsignedByte();
            }

            const frameGroup = new FrameGroup();
            frameGroup.type = groupType;
            frameGroup.width = this.readUnsignedByte();
            frameGroup.height = this.readUnsignedByte();

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = this.readUnsignedByte();
            } else {
                frameGroup.exactSize = SpriteExtent.DEFAULT_SIZE;
            }

            frameGroup.layers = this.readUnsignedByte();
            frameGroup.patternX = this.readUnsignedByte();
            frameGroup.patternY = this.readUnsignedByte();
            frameGroup.patternZ = this.readUnsignedByte();
            frameGroup.frames = this.readUnsignedByte();

            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.frameDurations = new Array<FrameDuration>(frameGroup.frames);

                if (frameDurations && this._settings) {
                    frameGroup.animationMode = this.readUnsignedByte();
                    frameGroup.loopCount = this.readInt();
                    frameGroup.startFrame = this.readByte();

                    for (let i = 0; i < frameGroup.frames; i++) {
                        const minimum = this.readUnsignedInt();
                        const maximum = this.readUnsignedInt();
                        frameGroup.frameDurations![i] = new FrameDuration(minimum, maximum);
                    }
                } else if (this._settings) {
                    const duration = this._settings.getDefaultDuration(type.category);
                    for (let i = 0; i < frameGroup.frames; i++) {
                        frameGroup.frameDurations![i] = new FrameDuration(duration, duration);
                    }
                }
            }

            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`A thing type has more than ${SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }

            frameGroup.spriteIndex = new Array<number>(totalSprites);
            for (let i = 0; i < totalSprites; i++) {
                if (extended) {
                    frameGroup.spriteIndex[i] = this.readUnsignedInt();
                } else {
                    frameGroup.spriteIndex[i] = this.readUnsignedShort();
                }
            }

            type.setFrameGroup(groupType, frameGroup);
        }

        return true;
    }

    // Note: Version-specific readers should be instantiated directly by ThingTypeStorage
    // This method is kept for convenience but may not be used
    public static fromFile(filePath: string, version: number): MetadataReader {
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray.fromBuffer(fileBuffer);
        
        // Version-specific readers will be created by ThingTypeStorage
        // This is a placeholder - actual implementation should use version-specific classes
        throw new Error(`Use version-specific MetadataReader classes directly. Version ${version} not handled here.`);
    }
}


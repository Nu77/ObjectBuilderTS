import { ByteArray } from "../utils/ByteArray";
import { FrameGroup } from "../animation/FrameGroup";
import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { IMetadataWriter } from "./IMetadataWriter";

export abstract class MetadataWriter implements IMetadataWriter {
    protected _bytes: ByteArray;

    constructor() {
        this._bytes = new ByteArray();
    }

    public writeByte(value: number): void { this._bytes.writeByte(value); }
    public writeShort(value: number): void { this._bytes.writeShort(value); }
    public writeUnsignedShort(value: number): void { this._bytes.writeShort(value); }
    public writeUnsignedInt(value: number): void { this._bytes.writeUnsignedInt(value); }
    public writeInt(value: number): void { this._bytes.writeUnsignedInt(value); } // TODO: Implement signed int

    public abstract writeProperties(type: ThingType): boolean;
    public abstract writeItemProperties(type: ThingType): boolean;

    public writeTexturePatterns(type: ThingType, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory.OUTFIT) {
            groupCount = type.frameGroups.length;
            this.writeByte(groupCount);
        }

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory.OUTFIT) {
                let group = groupType;
                if (groupCount < 2) {
                    group = 1;
                }
                this.writeByte(group);
            }

            const frameGroup = type.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }

            this.writeByte(frameGroup.width);  // Write width
            this.writeByte(frameGroup.height); // Write height

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                this.writeByte(frameGroup.exactSize); // Write exact size
            }

            this.writeByte(frameGroup.layers);   // Write layers
            this.writeByte(frameGroup.patternX); // Write pattern X
            this.writeByte(frameGroup.patternY); // Write pattern Y
            this.writeByte(frameGroup.patternZ); // Write pattern Z
            this.writeByte(frameGroup.frames);   // Write frames

            if (frameDurations && frameGroup.isAnimation && frameGroup.frameDurations) {
                this.writeByte(frameGroup.animationMode);   // Write animation type
                this.writeInt(frameGroup.loopCount);        // Write loop count
                this.writeByte(frameGroup.startFrame);      // Write start frame

                for (let i = 0; i < frameGroup.frames; i++) {
                    const duration = frameGroup.frameDurations[i];
                    this.writeUnsignedInt(duration.minimum); // Write minimum duration
                    this.writeUnsignedInt(duration.maximum); // Write maximum duration
                }
            }

            const spriteIndex = frameGroup.spriteIndex;
            if (spriteIndex) {
                const length = spriteIndex.length;
                for (let i = 0; i < length; i++) {
                    // Write sprite index
                    if (extended) {
                        this.writeUnsignedInt(spriteIndex[i]);
                    } else {
                        this.writeShort(spriteIndex[i]);
                    }
                }
            }
        }

        return true;
    }

    public toBuffer(): Buffer {
        return this._bytes.toBuffer();
    }
}


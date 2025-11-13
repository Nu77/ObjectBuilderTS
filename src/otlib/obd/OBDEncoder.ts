import * as fs from "fs";
import * as path from "path";
import * as lzma from "lzma-native";
import { ThingData } from "../things/ThingData";
import { ThingType } from "../things/ThingType";
import { ByteArray } from "../utils/ByteArray";
import { OBDVersions } from "./OBDVersions";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";
import { VersionStorage } from "../core/VersionStorage";
import { ThingCategory } from "../things/ThingCategory";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameGroupType } from "../things/FrameGroupType";
import { FrameDuration } from "../animation/FrameDuration";
import { SpriteData } from "../sprites/SpriteData";
import { SpriteExtent } from "../utils/SpriteExtent";
import { OTFormat } from "../utils/OTFormat";
import { Resources } from "../resources/Resources";

export class OBDEncoder {
    private _settings: ObjectBuilderSettings;

    // Property flags
    private static readonly STRING_CHARSET: string = "iso-8859-1";
    private static readonly GROUND: number = 0x00;
    private static readonly GROUND_BORDER: number = 0x01;
    private static readonly ON_BOTTOM: number = 0x02;
    private static readonly ON_TOP: number = 0x03;
    private static readonly CONTAINER: number = 0x04;
    private static readonly STACKABLE: number = 0x05;
    private static readonly FORCE_USE: number = 0x06;
    private static readonly MULTI_USE: number = 0x07;
    private static readonly WRITABLE: number = 0x08;
    private static readonly WRITABLE_ONCE: number = 0x09;
    private static readonly FLUID_CONTAINER: number = 0x0A;
    private static readonly FLUID: number = 0x0B;
    private static readonly UNPASSABLE: number = 0x0C;
    private static readonly UNMOVEABLE: number = 0x0D;
    private static readonly BLOCK_MISSILE: number = 0x0E;
    private static readonly BLOCK_PATHFIND: number = 0x0F;
    private static readonly NO_MOVE_ANIMATION: number = 0x10;
    private static readonly PICKUPABLE: number = 0x11;
    private static readonly HANGABLE: number = 0x12;
    private static readonly HOOK_SOUTH: number = 0x13;
    private static readonly HOOK_EAST: number = 0x14;
    private static readonly ROTATABLE: number = 0x15;
    private static readonly HAS_LIGHT: number = 0x16;
    private static readonly DONT_HIDE: number = 0x17;
    private static readonly TRANSLUCENT: number = 0x18;
    private static readonly HAS_OFFSET: number = 0x19;
    private static readonly HAS_ELEVATION: number = 0x1A;
    private static readonly LYING_OBJECT: number = 0x1B;
    private static readonly ANIMATE_ALWAYS: number = 0x1C;
    private static readonly MINI_MAP: number = 0x1D;
    private static readonly LENS_HELP: number = 0x1E;
    private static readonly FULL_GROUND: number = 0x1F;
    private static readonly IGNORE_LOOK: number = 0x20;
    private static readonly CLOTH: number = 0x21;
    private static readonly MARKET_ITEM: number = 0x22;
    private static readonly DEFAULT_ACTION: number = 0x23;
    private static readonly WRAPPABLE: number = 0x24;
    private static readonly UNWRAPPABLE: number = 0x25;
    private static readonly TOP_EFFECT: number = 0x26;
    private static readonly HAS_CHARGES: number = 0xFC;
    private static readonly FLOOR_CHANGE: number = 0xFD;
    private static readonly USABLE: number = 0xFE;
    private static readonly LAST_FLAG: number = 0xFF;

    constructor(settings: ObjectBuilderSettings) {
        this._settings = settings;
    }

    public async encode(data: ThingData): Promise<ByteArray> {
        if (!data) {
            throw new Error("data cannot be null");
        }

        if (data.obdVersion === OBDVersions.OBD_VERSION_3) {
            return await this.encodeV3(data);
        } else if (data.obdVersion === OBDVersions.OBD_VERSION_2) {
            return await this.encodeV2(data);
        } else if (data.obdVersion === OBDVersions.OBD_VERSION_1) {
            return this.encodeV1(data);
        } else {
            throw new Error(`Invalid OBD version ${data.obdVersion}`);
        }
    }

    public async decode(bytes: ByteArray): Promise<ThingData> {
        if (!bytes) {
            throw new Error("bytes cannot be null");
        }

        bytes.position = 0;

        // Decompress LZMA
        try {
            const compressed = bytes.toBuffer();
            const decompressed = await lzma.decompress(compressed);
            bytes = ByteArray.fromBuffer(Buffer.from(decompressed));
            bytes.position = 0;
        } catch (error) {
            // If decompression fails, assume data is already decompressed
            // For now, we'll try to read without decompression
        }

        const version = bytes.readUnsignedShort();
        if (version === OBDVersions.OBD_VERSION_3) {
            return this.decodeV3(bytes);
        } else if (version === OBDVersions.OBD_VERSION_2) {
            return this.decodeV2(bytes);
        } else if (version >= 710) {
            // OBD version 1: client version in the first two bytes
            return this.decodeV1(bytes);
        } else {
            throw new Error(`Invalid OBD version ${version}`);
        }
    }

    public async decodeFromFile(filePath: string): Promise<ThingData> {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        const ext = path.extname(filePath).substring(1).toLowerCase();
        if (ext !== OTFormat.OBD) {
            throw new Error("Invalid file extension.");
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray.fromBuffer(fileBuffer);
        return await this.decode(bytes);
    }

    // Private encoding methods
    private encodeV1(data: ThingData): ByteArray {
        // V1 encoding requires ThingSerializer which is not yet implemented
        throw new Error("OBD Version 1 encoding requires ThingSerializer, which is not yet implemented. Please use Version 2 or 3.");
    }

    private async encodeV2(data: ThingData): Promise<ByteArray> {
        const thing = data.thing;
        if (!thing) {
            throw new Error("thing cannot be null");
        }

        const bytes = new ByteArray();
        bytes.writeUnsignedShort(data.obdVersion);
        bytes.writeUnsignedShort(data.clientVersion);
        bytes.writeByte(ThingCategory.getValue(thing.category));

        const spritesPosition = bytes.length;
        bytes.writeUnsignedInt(0); // Placeholder for texture patterns position

        if (!this.writeProperties(thing, bytes)) {
            throw new Error("Failed to write properties");
        }

        // Write the texture patterns position
        const pos = bytes.length;
        bytes.position = spritesPosition;
        bytes.writeUnsignedInt(pos);
        bytes.position = pos;

        const groupType = FrameGroupType.DEFAULT;
        const frameGroup = thing.getFrameGroup(groupType);
        if (!frameGroup) {
            throw new Error("FrameGroup not found");
        }

        bytes.writeByte(frameGroup.width);
        bytes.writeByte(frameGroup.height);

        if (frameGroup.width > 1 || frameGroup.height > 1) {
            bytes.writeByte(frameGroup.exactSize);
        }

        bytes.writeByte(frameGroup.layers);
        bytes.writeByte(frameGroup.patternX);
        bytes.writeByte(frameGroup.patternY);
        bytes.writeByte(frameGroup.patternZ || 1);
        bytes.writeByte(frameGroup.frames);

        if (frameGroup.isAnimation) {
            bytes.writeByte(frameGroup.animationMode);
            bytes.writeInt(frameGroup.loopCount);
            bytes.writeByte(frameGroup.startFrame);

            if (frameGroup.frameDurations) {
                for (let i = 0; i < frameGroup.frames; i++) {
                    const duration = frameGroup.frameDurations![i];
                    bytes.writeUnsignedInt(duration.minimum);
                    bytes.writeUnsignedInt(duration.maximum);
                }
            }
        }

        const sprites = data.sprites.get(groupType);
        if (!sprites) {
            throw new Error("Sprites not found");
        }

        const spriteList = frameGroup.spriteIndex;
        if (!spriteList) {
            throw new Error("Sprite index not found");
        }

        const length = spriteList.length;
        for (let i = 0; i < length; i++) {
            const spriteId = spriteList[i];
            const spriteData = sprites[i];

            if (!spriteData || !spriteData.pixels) {
                throw new Error(`Invalid sprite id ${spriteId}.`);
            }

            const pixels = spriteData.pixels;
            if (pixels.length !== SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error("Invalid pixels length.");
            }

            bytes.writeUnsignedInt(spriteId);
            // Write pixel data directly
            const currentBuffer = bytes.toBuffer();
            const newBuffer = Buffer.alloc(currentBuffer.length + pixels.length);
            currentBuffer.copy(newBuffer);
            pixels.copy(newBuffer, currentBuffer.length);
            bytes.buffer = newBuffer;
            bytes.position = newBuffer.length;
        }

        // Compress with LZMA
        const uncompressed = bytes.toBuffer();
        const compressed = await lzma.compress(uncompressed, { format: lzma.FORMAT_ALONE });
        return ByteArray.fromBuffer(Buffer.from(compressed));
    }

    private async encodeV3(data: ThingData): Promise<ByteArray> {
        const thing = data.thing;
        if (!thing) {
            throw new Error("thing cannot be null");
        }

        const bytes = new ByteArray();
        bytes.writeUnsignedShort(data.obdVersion);
        bytes.writeUnsignedShort(data.clientVersion);
        bytes.writeByte(ThingCategory.getValue(thing.category));

        const spritesPosition = bytes.length;
        bytes.writeUnsignedInt(0); // Placeholder for texture patterns position

        if (!this.writeProperties(thing, bytes)) {
            throw new Error("Failed to write properties");
        }

        // Write the texture patterns position
        const pos = bytes.length;
        bytes.position = spritesPosition;
        bytes.writeUnsignedInt(pos);
        bytes.position = pos;

        let groupCount = 1;
        if (thing.category === ThingCategory.OUTFIT) {
            groupCount = thing.frameGroups.filter(g => g !== null).length;
            bytes.writeByte(groupCount);
        }

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (thing.category === ThingCategory.OUTFIT) {
                const group = groupType;
                bytes.writeByte(groupCount < 2 ? 1 : group);
            }

            const frameGroup = thing.getFrameGroup(groupType);
            if (!frameGroup) {
                throw new Error(`FrameGroup ${groupType} not found`);
            }

            bytes.writeByte(frameGroup.width);
            bytes.writeByte(frameGroup.height);

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                bytes.writeByte(frameGroup.exactSize);
            }

            bytes.writeByte(frameGroup.layers);
            bytes.writeByte(frameGroup.patternX);
            bytes.writeByte(frameGroup.patternY);
            bytes.writeByte(frameGroup.patternZ || 1);
            bytes.writeByte(frameGroup.frames);

            if (frameGroup.isAnimation) {
                bytes.writeByte(frameGroup.animationMode);
                bytes.writeInt(frameGroup.loopCount);
                bytes.writeByte(frameGroup.startFrame);

                if (frameGroup.frameDurations) {
                    for (let i = 0; i < frameGroup.frames; i++) {
                        const duration = frameGroup.frameDurations[i];
                        bytes.writeUnsignedInt(duration.minimum);
                        bytes.writeUnsignedInt(duration.maximum);
                    }
                }
            }

            const spriteList = frameGroup.spriteIndex;
            if (!spriteList) {
                throw new Error("Sprite index not found");
            }

            const sprites = data.sprites.get(groupType);
            if (!sprites) {
                throw new Error(`Sprites for group ${groupType} not found`);
            }

            const length = sprites.length;
            for (let i = 0; i < length; i++) {
                const spriteId = spriteList[i];
                const spriteData = sprites[i];

                if (!spriteData || !spriteData.pixels) {
                    throw new Error(`Invalid sprite id ${spriteId}.`);
                }

                const pixels = spriteData.pixels;
                if (pixels.length !== SpriteExtent.DEFAULT_DATA_SIZE) {
                    throw new Error("Invalid pixels length.");
                }

                bytes.writeUnsignedInt(spriteId);
                bytes.writeUnsignedInt(pixels.length);
                // Write pixel data directly
                const currentBuffer = bytes.toBuffer();
                const newBuffer = Buffer.alloc(currentBuffer.length + pixels.length);
                currentBuffer.copy(newBuffer);
                pixels.copy(newBuffer, currentBuffer.length);
                bytes.buffer = newBuffer;
                bytes.position = newBuffer.length;
            }
        }

        // Compress with LZMA
        const uncompressed = bytes.toBuffer();
        const compressed = await lzma.compress(uncompressed, { format: lzma.FORMAT_ALONE });
        return ByteArray.fromBuffer(Buffer.from(compressed));
    }

    // Private decoding methods
    private decodeV1(bytes: ByteArray): ThingData {
        bytes.position = 0;

        const obdVersion = OBDVersions.OBD_VERSION_1;
        const clientVersion = bytes.readUnsignedShort();

        const versions = VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }

        const category = bytes.readUTF();
        if (!ThingCategory.isValid(category)) {
            throw new Error("Invalid thing category.");
        }

        // V1 decoding requires ThingSerializer which is not yet implemented
        throw new Error("OBD Version 1 decoding requires ThingSerializer, which is not yet implemented. Please use Version 2 or 3.");
    }

    private decodeV2(bytes: ByteArray): ThingData {
        bytes.position = 0;

        const obdVersion = bytes.readUnsignedShort();
        const clientVersion = bytes.readUnsignedShort();

        const versions = VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }

        const category = ThingCategory.getCategoryByValue(bytes.readUnsignedByte());
        if (!category || !ThingCategory.isValid(category)) {
            throw new Error("Invalid object category.");
        }

        // Skip texture patterns position
        bytes.readUnsignedInt();

        const thing = new ThingType();
        thing.category = category;

        if (!this.readProperties(thing, bytes)) {
            throw new Error("Failed to read properties");
        }

        const groupType = FrameGroupType.DEFAULT;
        const frameGroup = new FrameGroup();

        frameGroup.width = bytes.readUnsignedByte();
        frameGroup.height = bytes.readUnsignedByte();

        if (frameGroup.width > 1 || frameGroup.height > 1) {
            frameGroup.exactSize = bytes.readUnsignedByte();
        } else {
            frameGroup.exactSize = SpriteExtent.DEFAULT_SIZE;
        }

        frameGroup.layers = bytes.readUnsignedByte();
        frameGroup.patternX = bytes.readUnsignedByte();
        frameGroup.patternY = bytes.readUnsignedByte();
        frameGroup.patternZ = bytes.readUnsignedByte();
        frameGroup.frames = bytes.readUnsignedByte();

        if (frameGroup.frames > 1) {
            frameGroup.isAnimation = true;
            frameGroup.animationMode = bytes.readUnsignedByte();
            frameGroup.loopCount = bytes.readInt();
            frameGroup.startFrame = bytes.readByte();
            frameGroup.frameDurations = [];

            for (let i = 0; i < frameGroup.frames; i++) {
                const minimum = bytes.readUnsignedInt();
                const maximum = bytes.readUnsignedInt();
                frameGroup.frameDurations.push(new FrameDuration(minimum, maximum));
            }
        }

        const totalSprites = frameGroup.getTotalSprites();
        if (totalSprites > SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error(`The Object Data has more than ${SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
        }

        frameGroup.spriteIndex = [];

        const sprites = new Map<number, SpriteData[]>();
        sprites.set(groupType, []);

        for (let i = 0; i < totalSprites; i++) {
            const spriteId = bytes.readUnsignedInt();
            frameGroup.spriteIndex.push(spriteId);

            const pixels = new ByteArray();
            bytes.readBytes(pixels, 0, SpriteExtent.DEFAULT_DATA_SIZE);

            const spriteData = new SpriteData();
            spriteData.id = spriteId;
            spriteData.pixels = pixels.toBuffer();
            sprites.get(groupType)!.push(spriteData);
        }

        thing.setFrameGroup(groupType, frameGroup);
        return ThingData.create(obdVersion, clientVersion, thing, sprites);
    }

    private decodeV3(bytes: ByteArray): ThingData {
        bytes.position = 0;

        const obdVersion = bytes.readUnsignedShort();
        const clientVersion = bytes.readUnsignedShort();

        const versions = VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }

        const category = ThingCategory.getCategoryByValue(bytes.readUnsignedByte());
        if (!category || !ThingCategory.isValid(category)) {
            throw new Error("Invalid object category.");
        }

        // Skip texture patterns position
        bytes.readUnsignedInt();

        const thing = new ThingType();
        thing.category = category;

        if (!this.readProperties(thing, bytes)) {
            throw new Error("Failed to read properties");
        }

        let groupCount = 1;
        if (thing.category === ThingCategory.OUTFIT) {
            groupCount = bytes.readUnsignedByte();
        }

        const sprites = new Map<number, SpriteData[]>();

        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (thing.category === ThingCategory.OUTFIT) {
                bytes.readUnsignedByte(); // Skip group type
            }

            const frameGroup = new FrameGroup();
            frameGroup.width = bytes.readUnsignedByte();
            frameGroup.height = bytes.readUnsignedByte();

            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = bytes.readUnsignedByte();
            } else {
                frameGroup.exactSize = SpriteExtent.DEFAULT_SIZE;
            }

            frameGroup.layers = bytes.readUnsignedByte();
            frameGroup.patternX = bytes.readUnsignedByte();
            frameGroup.patternY = bytes.readUnsignedByte();
            frameGroup.patternZ = bytes.readUnsignedByte();
            frameGroup.frames = bytes.readUnsignedByte();

            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.animationMode = bytes.readUnsignedByte();
                frameGroup.loopCount = bytes.readInt();
                frameGroup.startFrame = bytes.readByte();
                frameGroup.frameDurations = [];

                for (let i = 0; i < frameGroup.frames; i++) {
                    const minimum = bytes.readUnsignedInt();
                    const maximum = bytes.readUnsignedInt();
                    frameGroup.frameDurations.push(new FrameDuration(minimum, maximum));
                }
            }

            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`The Object Data has more than ${SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }

            frameGroup.spriteIndex = [];
            sprites.set(groupType, []);

            for (let i = 0; i < totalSprites; i++) {
                const spriteId = bytes.readUnsignedInt();
                frameGroup.spriteIndex.push(spriteId);

                const dataSize = bytes.readUnsignedInt();
                if (dataSize > SpriteExtent.DEFAULT_DATA_SIZE) {
                    throw new Error("Invalid sprite data size.");
                }

                const pixels = new ByteArray();
                bytes.readBytes(pixels, 0, dataSize);

                const spriteData = new SpriteData();
                spriteData.id = spriteId;
                spriteData.pixels = pixels.toBuffer();
                sprites.get(groupType)!.push(spriteData);
            }

            thing.setFrameGroup(groupType, frameGroup);
        }

        return ThingData.create(obdVersion, clientVersion, thing, sprites);
    }

    // Property reading/writing
    private readProperties(thing: ThingType, input: ByteArray): boolean {
        let flag = 0;
        while (flag < OBDEncoder.LAST_FLAG) {
            const previousFlag = flag;
            flag = input.readUnsignedByte();
            if (flag === OBDEncoder.LAST_FLAG) return true;

            switch (flag) {
                case OBDEncoder.GROUND:
                    thing.isGround = true;
                    thing.groundSpeed = input.readUnsignedShort();
                    break;
                case OBDEncoder.GROUND_BORDER:
                    thing.isGroundBorder = true;
                    break;
                case OBDEncoder.ON_BOTTOM:
                    thing.isOnBottom = true;
                    break;
                case OBDEncoder.ON_TOP:
                    thing.isOnTop = true;
                    break;
                case OBDEncoder.CONTAINER:
                    thing.isContainer = true;
                    break;
                case OBDEncoder.STACKABLE:
                    thing.stackable = true;
                    break;
                case OBDEncoder.FORCE_USE:
                    thing.forceUse = true;
                    break;
                case OBDEncoder.MULTI_USE:
                    thing.multiUse = true;
                    break;
                case OBDEncoder.WRITABLE:
                    thing.writable = true;
                    thing.maxTextLength = input.readUnsignedShort();
                    break;
                case OBDEncoder.WRITABLE_ONCE:
                    thing.writableOnce = true;
                    thing.maxTextLength = input.readUnsignedShort();
                    break;
                case OBDEncoder.FLUID_CONTAINER:
                    thing.isFluidContainer = true;
                    break;
                case OBDEncoder.FLUID:
                    thing.isFluid = true;
                    break;
                case OBDEncoder.UNPASSABLE:
                    thing.isUnpassable = true;
                    break;
                case OBDEncoder.UNMOVEABLE:
                    thing.isUnmoveable = true;
                    break;
                case OBDEncoder.BLOCK_MISSILE:
                    thing.blockMissile = true;
                    break;
                case OBDEncoder.BLOCK_PATHFIND:
                    thing.blockPathfind = true;
                    break;
                case OBDEncoder.NO_MOVE_ANIMATION:
                    thing.noMoveAnimation = true;
                    break;
                case OBDEncoder.PICKUPABLE:
                    thing.pickupable = true;
                    break;
                case OBDEncoder.HANGABLE:
                    thing.hangable = true;
                    break;
                case OBDEncoder.HOOK_SOUTH:
                    thing.isVertical = true;
                    break;
                case OBDEncoder.HOOK_EAST:
                    thing.isHorizontal = true;
                    break;
                case OBDEncoder.ROTATABLE:
                    thing.rotatable = true;
                    break;
                case OBDEncoder.HAS_LIGHT:
                    thing.hasLight = true;
                    thing.lightLevel = input.readUnsignedShort();
                    thing.lightColor = input.readUnsignedShort();
                    break;
                case OBDEncoder.DONT_HIDE:
                    thing.dontHide = true;
                    break;
                case OBDEncoder.TRANSLUCENT:
                    thing.isTranslucent = true;
                    break;
                case OBDEncoder.HAS_OFFSET:
                    thing.hasOffset = true;
                    thing.offsetX = input.readShort();
                    thing.offsetY = input.readShort();
                    break;
                case OBDEncoder.HAS_ELEVATION:
                    thing.hasElevation = true;
                    thing.elevation = input.readUnsignedShort();
                    break;
                case OBDEncoder.LYING_OBJECT:
                    thing.isLyingObject = true;
                    break;
                case OBDEncoder.ANIMATE_ALWAYS:
                    thing.animateAlways = true;
                    break;
                case OBDEncoder.MINI_MAP:
                    thing.miniMap = true;
                    thing.miniMapColor = input.readUnsignedShort();
                    break;
                case OBDEncoder.LENS_HELP:
                    thing.isLensHelp = true;
                    thing.lensHelp = input.readUnsignedShort();
                    break;
                case OBDEncoder.FULL_GROUND:
                    thing.isFullGround = true;
                    break;
                case OBDEncoder.IGNORE_LOOK:
                    thing.ignoreLook = true;
                    break;
                case OBDEncoder.CLOTH:
                    thing.cloth = true;
                    thing.clothSlot = input.readUnsignedShort();
                    break;
                case OBDEncoder.MARKET_ITEM:
                    thing.isMarketItem = true;
                    thing.marketCategory = input.readUnsignedShort();
                    thing.marketTradeAs = input.readUnsignedShort();
                    thing.marketShowAs = input.readUnsignedShort();
                    const nameLength = input.readUnsignedShort();
                    thing.marketName = input.readMultiByte(nameLength, OBDEncoder.STRING_CHARSET);
                    thing.marketRestrictProfession = input.readUnsignedShort();
                    thing.marketRestrictLevel = input.readUnsignedShort();
                    break;
                case OBDEncoder.DEFAULT_ACTION:
                    thing.hasDefaultAction = true;
                    thing.defaultAction = input.readUnsignedShort();
                    break;
                case OBDEncoder.HAS_CHARGES:
                    thing.hasCharges = true;
                    break;
                case OBDEncoder.FLOOR_CHANGE:
                    thing.floorChange = true;
                    break;
                case OBDEncoder.WRAPPABLE:
                    thing.wrappable = true;
                    break;
                case OBDEncoder.UNWRAPPABLE:
                    thing.unwrappable = true;
                    break;
                case OBDEncoder.TOP_EFFECT:
                    thing.topEffect = true;
                    break;
                case OBDEncoder.USABLE:
                    thing.usable = true;
                    break;
                default:
                    throw new Error(`Unknown flag 0x${flag.toString(16)} (previous: 0x${previousFlag.toString(16)}, category: ${thing.category}, id: ${thing.id})`);
            }
        }
        return true;
    }

    private writeProperties(thing: ThingType, output: ByteArray): boolean {
        if (thing.isGround) {
            output.writeByte(OBDEncoder.GROUND);
            output.writeShort(thing.groundSpeed);
        } else if (thing.isGroundBorder) {
            output.writeByte(OBDEncoder.GROUND_BORDER);
        } else if (thing.isOnBottom) {
            output.writeByte(OBDEncoder.ON_BOTTOM);
        } else if (thing.isOnTop) {
            output.writeByte(OBDEncoder.ON_TOP);
        }

        if (thing.isContainer) output.writeByte(OBDEncoder.CONTAINER);
        if (thing.stackable) output.writeByte(OBDEncoder.STACKABLE);
        if (thing.forceUse) output.writeByte(OBDEncoder.FORCE_USE);
        if (thing.multiUse) output.writeByte(OBDEncoder.MULTI_USE);

        if (thing.writable) {
            output.writeByte(OBDEncoder.WRITABLE);
            output.writeShort(thing.maxTextLength);
        }

        if (thing.writableOnce) {
            output.writeByte(OBDEncoder.WRITABLE_ONCE);
            output.writeShort(thing.maxTextLength);
        }

        if (thing.isFluidContainer) output.writeByte(OBDEncoder.FLUID_CONTAINER);
        if (thing.isFluid) output.writeByte(OBDEncoder.FLUID);
        if (thing.isUnpassable) output.writeByte(OBDEncoder.UNPASSABLE);
        if (thing.isUnmoveable) output.writeByte(OBDEncoder.UNMOVEABLE);
        if (thing.blockMissile) output.writeByte(OBDEncoder.BLOCK_MISSILE);
        if (thing.blockPathfind) output.writeByte(OBDEncoder.BLOCK_PATHFIND);
        if (thing.noMoveAnimation) output.writeByte(OBDEncoder.NO_MOVE_ANIMATION);
        if (thing.pickupable) output.writeByte(OBDEncoder.PICKUPABLE);
        if (thing.hangable) output.writeByte(OBDEncoder.HANGABLE);
        if (thing.isVertical) output.writeByte(OBDEncoder.HOOK_SOUTH);
        if (thing.isHorizontal) output.writeByte(OBDEncoder.HOOK_EAST);
        if (thing.rotatable) output.writeByte(OBDEncoder.ROTATABLE);

        if (thing.hasLight) {
            output.writeByte(OBDEncoder.HAS_LIGHT);
            output.writeShort(thing.lightLevel);
            output.writeShort(thing.lightColor);
        }

        if (thing.dontHide) output.writeByte(OBDEncoder.DONT_HIDE);
        if (thing.isTranslucent) output.writeByte(OBDEncoder.TRANSLUCENT);

        if (thing.hasOffset) {
            output.writeByte(OBDEncoder.HAS_OFFSET);
            output.writeShort(thing.offsetX);
            output.writeShort(thing.offsetY);
        }

        if (thing.hasElevation) {
            output.writeByte(OBDEncoder.HAS_ELEVATION);
            output.writeShort(thing.elevation);
        }

        if (thing.isLyingObject) output.writeByte(OBDEncoder.LYING_OBJECT);
        if (thing.animateAlways) output.writeByte(OBDEncoder.ANIMATE_ALWAYS);

        if (thing.miniMap) {
            output.writeByte(OBDEncoder.MINI_MAP);
            output.writeShort(thing.miniMapColor);
        }

        if (thing.isLensHelp) {
            output.writeByte(OBDEncoder.LENS_HELP);
            output.writeShort(thing.lensHelp);
        }

        if (thing.isFullGround) output.writeByte(OBDEncoder.FULL_GROUND);
        if (thing.ignoreLook) output.writeByte(OBDEncoder.IGNORE_LOOK);

        if (thing.cloth) {
            output.writeByte(OBDEncoder.CLOTH);
            output.writeShort(thing.clothSlot);
        }

        if (thing.isMarketItem) {
            output.writeByte(OBDEncoder.MARKET_ITEM);
            output.writeShort(thing.marketCategory);
            output.writeShort(thing.marketTradeAs);
            output.writeShort(thing.marketShowAs);
            output.writeShort(thing.marketName.length);
            output.writeMultiByte(thing.marketName, OBDEncoder.STRING_CHARSET);
            output.writeShort(thing.marketRestrictProfession);
            output.writeShort(thing.marketRestrictLevel);
        }

        if (thing.hasDefaultAction) {
            output.writeByte(OBDEncoder.DEFAULT_ACTION);
            output.writeShort(thing.defaultAction);
        }

        if (thing.wrappable) output.writeByte(OBDEncoder.WRAPPABLE);
        if (thing.unwrappable) output.writeByte(OBDEncoder.UNWRAPPABLE);
        if (thing.topEffect) output.writeByte(OBDEncoder.TOP_EFFECT);
        if (thing.hasCharges) output.writeByte(OBDEncoder.HAS_CHARGES);
        if (thing.floorChange) output.writeByte(OBDEncoder.FLOOR_CHANGE);
        if (thing.usable) output.writeByte(OBDEncoder.USABLE);

        output.writeByte(OBDEncoder.LAST_FLAG);
        return true;
    }
}

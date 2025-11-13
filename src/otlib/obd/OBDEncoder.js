"use strict";
/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBDEncoder = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lzma = __importStar(require("lzma-native"));
const ThingData_1 = require("../things/ThingData");
const ThingType_1 = require("../things/ThingType");
const ByteArray_1 = require("../utils/ByteArray");
const OBDVersions_1 = require("./OBDVersions");
const VersionStorage_1 = require("../core/VersionStorage");
const ThingCategory_1 = require("../things/ThingCategory");
const FrameGroup_1 = require("../animation/FrameGroup");
const FrameGroupType_1 = require("../things/FrameGroupType");
const FrameDuration_1 = require("../animation/FrameDuration");
const SpriteData_1 = require("../sprites/SpriteData");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const OTFormat_1 = require("../utils/OTFormat");
class OBDEncoder {
    constructor(settings) {
        this._settings = settings;
    }
    async encode(data) {
        if (!data) {
            throw new Error("data cannot be null");
        }
        if (data.obdVersion === OBDVersions_1.OBDVersions.OBD_VERSION_3) {
            return await this.encodeV3(data);
        }
        else if (data.obdVersion === OBDVersions_1.OBDVersions.OBD_VERSION_2) {
            return await this.encodeV2(data);
        }
        else if (data.obdVersion === OBDVersions_1.OBDVersions.OBD_VERSION_1) {
            return this.encodeV1(data);
        }
        else {
            throw new Error(`Invalid OBD version ${data.obdVersion}`);
        }
    }
    async decode(bytes) {
        if (!bytes) {
            throw new Error("bytes cannot be null");
        }
        bytes.position = 0;
        // Decompress LZMA
        try {
            const compressed = bytes.toBuffer();
            const decompressed = await lzma.decompress(compressed);
            bytes = ByteArray_1.ByteArray.fromBuffer(Buffer.from(decompressed));
            bytes.position = 0;
        }
        catch (error) {
            // If decompression fails, assume data is already decompressed
            // For now, we'll try to read without decompression
        }
        const version = bytes.readUnsignedShort();
        if (version === OBDVersions_1.OBDVersions.OBD_VERSION_3) {
            return this.decodeV3(bytes);
        }
        else if (version === OBDVersions_1.OBDVersions.OBD_VERSION_2) {
            return this.decodeV2(bytes);
        }
        else if (version >= 710) {
            // OBD version 1: client version in the first two bytes
            return this.decodeV1(bytes);
        }
        else {
            throw new Error(`Invalid OBD version ${version}`);
        }
    }
    async decodeFromFile(filePath) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        const ext = path.extname(filePath).substring(1).toLowerCase();
        if (ext !== OTFormat_1.OTFormat.OBD) {
            throw new Error("Invalid file extension.");
        }
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
        return await this.decode(bytes);
    }
    // Private encoding methods
    encodeV1(data) {
        // V1 encoding requires ThingSerializer which is not yet implemented
        throw new Error("OBD Version 1 encoding requires ThingSerializer, which is not yet implemented. Please use Version 2 or 3.");
    }
    async encodeV2(data) {
        const thing = data.thing;
        if (!thing) {
            throw new Error("thing cannot be null");
        }
        const bytes = new ByteArray_1.ByteArray();
        bytes.writeUnsignedShort(data.obdVersion);
        bytes.writeUnsignedShort(data.clientVersion);
        bytes.writeByte(ThingCategory_1.ThingCategory.getValue(thing.category));
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
        const groupType = FrameGroupType_1.FrameGroupType.DEFAULT;
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
                    const duration = frameGroup.frameDurations[i];
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
            if (pixels.length !== SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
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
        return ByteArray_1.ByteArray.fromBuffer(Buffer.from(compressed));
    }
    async encodeV3(data) {
        const thing = data.thing;
        if (!thing) {
            throw new Error("thing cannot be null");
        }
        const bytes = new ByteArray_1.ByteArray();
        bytes.writeUnsignedShort(data.obdVersion);
        bytes.writeUnsignedShort(data.clientVersion);
        bytes.writeByte(ThingCategory_1.ThingCategory.getValue(thing.category));
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
        if (thing.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = thing.frameGroups.filter(g => g !== null).length;
            bytes.writeByte(groupCount);
        }
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (thing.category === ThingCategory_1.ThingCategory.OUTFIT) {
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
                if (pixels.length !== SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
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
        return ByteArray_1.ByteArray.fromBuffer(Buffer.from(compressed));
    }
    // Private decoding methods
    decodeV1(bytes) {
        bytes.position = 0;
        const obdVersion = OBDVersions_1.OBDVersions.OBD_VERSION_1;
        const clientVersion = bytes.readUnsignedShort();
        const versions = VersionStorage_1.VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }
        const category = bytes.readUTF();
        if (!ThingCategory_1.ThingCategory.isValid(category)) {
            throw new Error("Invalid thing category.");
        }
        // V1 decoding requires ThingSerializer which is not yet implemented
        throw new Error("OBD Version 1 decoding requires ThingSerializer, which is not yet implemented. Please use Version 2 or 3.");
    }
    decodeV2(bytes) {
        bytes.position = 0;
        const obdVersion = bytes.readUnsignedShort();
        const clientVersion = bytes.readUnsignedShort();
        const versions = VersionStorage_1.VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }
        const category = ThingCategory_1.ThingCategory.getCategoryByValue(bytes.readUnsignedByte());
        if (!category || !ThingCategory_1.ThingCategory.isValid(category)) {
            throw new Error("Invalid object category.");
        }
        // Skip texture patterns position
        bytes.readUnsignedInt();
        const thing = new ThingType_1.ThingType();
        thing.category = category;
        if (!this.readProperties(thing, bytes)) {
            throw new Error("Failed to read properties");
        }
        const groupType = FrameGroupType_1.FrameGroupType.DEFAULT;
        const frameGroup = new FrameGroup_1.FrameGroup();
        frameGroup.width = bytes.readUnsignedByte();
        frameGroup.height = bytes.readUnsignedByte();
        if (frameGroup.width > 1 || frameGroup.height > 1) {
            frameGroup.exactSize = bytes.readUnsignedByte();
        }
        else {
            frameGroup.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
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
                frameGroup.frameDurations.push(new FrameDuration_1.FrameDuration(minimum, maximum));
            }
        }
        const totalSprites = frameGroup.getTotalSprites();
        if (totalSprites > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error(`The Object Data has more than ${SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
        }
        frameGroup.spriteIndex = [];
        const sprites = new Map();
        sprites.set(groupType, []);
        for (let i = 0; i < totalSprites; i++) {
            const spriteId = bytes.readUnsignedInt();
            frameGroup.spriteIndex.push(spriteId);
            const pixels = new ByteArray_1.ByteArray();
            bytes.readBytes(pixels, 0, SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE);
            const spriteData = new SpriteData_1.SpriteData();
            spriteData.id = spriteId;
            spriteData.pixels = pixels.toBuffer();
            sprites.get(groupType).push(spriteData);
        }
        thing.setFrameGroup(groupType, frameGroup);
        return ThingData_1.ThingData.create(obdVersion, clientVersion, thing, sprites);
    }
    decodeV3(bytes) {
        bytes.position = 0;
        const obdVersion = bytes.readUnsignedShort();
        const clientVersion = bytes.readUnsignedShort();
        const versions = VersionStorage_1.VersionStorage.getInstance().getByValue(clientVersion);
        if (versions.length === 0) {
            throw new Error(`Unsupported version ${clientVersion}.`);
        }
        const category = ThingCategory_1.ThingCategory.getCategoryByValue(bytes.readUnsignedByte());
        if (!category || !ThingCategory_1.ThingCategory.isValid(category)) {
            throw new Error("Invalid object category.");
        }
        // Skip texture patterns position
        bytes.readUnsignedInt();
        const thing = new ThingType_1.ThingType();
        thing.category = category;
        if (!this.readProperties(thing, bytes)) {
            throw new Error("Failed to read properties");
        }
        let groupCount = 1;
        if (thing.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = bytes.readUnsignedByte();
        }
        const sprites = new Map();
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (thing.category === ThingCategory_1.ThingCategory.OUTFIT) {
                bytes.readUnsignedByte(); // Skip group type
            }
            const frameGroup = new FrameGroup_1.FrameGroup();
            frameGroup.width = bytes.readUnsignedByte();
            frameGroup.height = bytes.readUnsignedByte();
            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = bytes.readUnsignedByte();
            }
            else {
                frameGroup.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
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
                    frameGroup.frameDurations.push(new FrameDuration_1.FrameDuration(minimum, maximum));
                }
            }
            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`The Object Data has more than ${SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }
            frameGroup.spriteIndex = [];
            sprites.set(groupType, []);
            for (let i = 0; i < totalSprites; i++) {
                const spriteId = bytes.readUnsignedInt();
                frameGroup.spriteIndex.push(spriteId);
                const dataSize = bytes.readUnsignedInt();
                if (dataSize > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
                    throw new Error("Invalid sprite data size.");
                }
                const pixels = new ByteArray_1.ByteArray();
                bytes.readBytes(pixels, 0, dataSize);
                const spriteData = new SpriteData_1.SpriteData();
                spriteData.id = spriteId;
                spriteData.pixels = pixels.toBuffer();
                sprites.get(groupType).push(spriteData);
            }
            thing.setFrameGroup(groupType, frameGroup);
        }
        return ThingData_1.ThingData.create(obdVersion, clientVersion, thing, sprites);
    }
    // Property reading/writing
    readProperties(thing, input) {
        let flag = 0;
        while (flag < OBDEncoder.LAST_FLAG) {
            const previousFlag = flag;
            flag = input.readUnsignedByte();
            if (flag === OBDEncoder.LAST_FLAG)
                return true;
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
    writeProperties(thing, output) {
        if (thing.isGround) {
            output.writeByte(OBDEncoder.GROUND);
            output.writeShort(thing.groundSpeed);
        }
        else if (thing.isGroundBorder) {
            output.writeByte(OBDEncoder.GROUND_BORDER);
        }
        else if (thing.isOnBottom) {
            output.writeByte(OBDEncoder.ON_BOTTOM);
        }
        else if (thing.isOnTop) {
            output.writeByte(OBDEncoder.ON_TOP);
        }
        if (thing.isContainer)
            output.writeByte(OBDEncoder.CONTAINER);
        if (thing.stackable)
            output.writeByte(OBDEncoder.STACKABLE);
        if (thing.forceUse)
            output.writeByte(OBDEncoder.FORCE_USE);
        if (thing.multiUse)
            output.writeByte(OBDEncoder.MULTI_USE);
        if (thing.writable) {
            output.writeByte(OBDEncoder.WRITABLE);
            output.writeShort(thing.maxTextLength);
        }
        if (thing.writableOnce) {
            output.writeByte(OBDEncoder.WRITABLE_ONCE);
            output.writeShort(thing.maxTextLength);
        }
        if (thing.isFluidContainer)
            output.writeByte(OBDEncoder.FLUID_CONTAINER);
        if (thing.isFluid)
            output.writeByte(OBDEncoder.FLUID);
        if (thing.isUnpassable)
            output.writeByte(OBDEncoder.UNPASSABLE);
        if (thing.isUnmoveable)
            output.writeByte(OBDEncoder.UNMOVEABLE);
        if (thing.blockMissile)
            output.writeByte(OBDEncoder.BLOCK_MISSILE);
        if (thing.blockPathfind)
            output.writeByte(OBDEncoder.BLOCK_PATHFIND);
        if (thing.noMoveAnimation)
            output.writeByte(OBDEncoder.NO_MOVE_ANIMATION);
        if (thing.pickupable)
            output.writeByte(OBDEncoder.PICKUPABLE);
        if (thing.hangable)
            output.writeByte(OBDEncoder.HANGABLE);
        if (thing.isVertical)
            output.writeByte(OBDEncoder.HOOK_SOUTH);
        if (thing.isHorizontal)
            output.writeByte(OBDEncoder.HOOK_EAST);
        if (thing.rotatable)
            output.writeByte(OBDEncoder.ROTATABLE);
        if (thing.hasLight) {
            output.writeByte(OBDEncoder.HAS_LIGHT);
            output.writeShort(thing.lightLevel);
            output.writeShort(thing.lightColor);
        }
        if (thing.dontHide)
            output.writeByte(OBDEncoder.DONT_HIDE);
        if (thing.isTranslucent)
            output.writeByte(OBDEncoder.TRANSLUCENT);
        if (thing.hasOffset) {
            output.writeByte(OBDEncoder.HAS_OFFSET);
            output.writeShort(thing.offsetX);
            output.writeShort(thing.offsetY);
        }
        if (thing.hasElevation) {
            output.writeByte(OBDEncoder.HAS_ELEVATION);
            output.writeShort(thing.elevation);
        }
        if (thing.isLyingObject)
            output.writeByte(OBDEncoder.LYING_OBJECT);
        if (thing.animateAlways)
            output.writeByte(OBDEncoder.ANIMATE_ALWAYS);
        if (thing.miniMap) {
            output.writeByte(OBDEncoder.MINI_MAP);
            output.writeShort(thing.miniMapColor);
        }
        if (thing.isLensHelp) {
            output.writeByte(OBDEncoder.LENS_HELP);
            output.writeShort(thing.lensHelp);
        }
        if (thing.isFullGround)
            output.writeByte(OBDEncoder.FULL_GROUND);
        if (thing.ignoreLook)
            output.writeByte(OBDEncoder.IGNORE_LOOK);
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
        if (thing.wrappable)
            output.writeByte(OBDEncoder.WRAPPABLE);
        if (thing.unwrappable)
            output.writeByte(OBDEncoder.UNWRAPPABLE);
        if (thing.topEffect)
            output.writeByte(OBDEncoder.TOP_EFFECT);
        if (thing.hasCharges)
            output.writeByte(OBDEncoder.HAS_CHARGES);
        if (thing.floorChange)
            output.writeByte(OBDEncoder.FLOOR_CHANGE);
        if (thing.usable)
            output.writeByte(OBDEncoder.USABLE);
        output.writeByte(OBDEncoder.LAST_FLAG);
        return true;
    }
}
exports.OBDEncoder = OBDEncoder;
// Property flags
OBDEncoder.STRING_CHARSET = "iso-8859-1";
OBDEncoder.GROUND = 0x00;
OBDEncoder.GROUND_BORDER = 0x01;
OBDEncoder.ON_BOTTOM = 0x02;
OBDEncoder.ON_TOP = 0x03;
OBDEncoder.CONTAINER = 0x04;
OBDEncoder.STACKABLE = 0x05;
OBDEncoder.FORCE_USE = 0x06;
OBDEncoder.MULTI_USE = 0x07;
OBDEncoder.WRITABLE = 0x08;
OBDEncoder.WRITABLE_ONCE = 0x09;
OBDEncoder.FLUID_CONTAINER = 0x0A;
OBDEncoder.FLUID = 0x0B;
OBDEncoder.UNPASSABLE = 0x0C;
OBDEncoder.UNMOVEABLE = 0x0D;
OBDEncoder.BLOCK_MISSILE = 0x0E;
OBDEncoder.BLOCK_PATHFIND = 0x0F;
OBDEncoder.NO_MOVE_ANIMATION = 0x10;
OBDEncoder.PICKUPABLE = 0x11;
OBDEncoder.HANGABLE = 0x12;
OBDEncoder.HOOK_SOUTH = 0x13;
OBDEncoder.HOOK_EAST = 0x14;
OBDEncoder.ROTATABLE = 0x15;
OBDEncoder.HAS_LIGHT = 0x16;
OBDEncoder.DONT_HIDE = 0x17;
OBDEncoder.TRANSLUCENT = 0x18;
OBDEncoder.HAS_OFFSET = 0x19;
OBDEncoder.HAS_ELEVATION = 0x1A;
OBDEncoder.LYING_OBJECT = 0x1B;
OBDEncoder.ANIMATE_ALWAYS = 0x1C;
OBDEncoder.MINI_MAP = 0x1D;
OBDEncoder.LENS_HELP = 0x1E;
OBDEncoder.FULL_GROUND = 0x1F;
OBDEncoder.IGNORE_LOOK = 0x20;
OBDEncoder.CLOTH = 0x21;
OBDEncoder.MARKET_ITEM = 0x22;
OBDEncoder.DEFAULT_ACTION = 0x23;
OBDEncoder.WRAPPABLE = 0x24;
OBDEncoder.UNWRAPPABLE = 0x25;
OBDEncoder.TOP_EFFECT = 0x26;
OBDEncoder.HAS_CHARGES = 0xFC;
OBDEncoder.FLOOR_CHANGE = 0xFD;
OBDEncoder.USABLE = 0xFE;
OBDEncoder.LAST_FLAG = 0xFF;

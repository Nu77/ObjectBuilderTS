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
exports.MetadataReader = void 0;
const fs = __importStar(require("fs"));
const ByteArray_1 = require("../utils/ByteArray");
const FrameGroup_1 = require("../animation/FrameGroup");
const FrameDuration_1 = require("../animation/FrameDuration");
const ThingCategory_1 = require("./ThingCategory");
const MetadataFilePosition_1 = require("./MetadataFilePosition");
const SpriteExtent_1 = require("../utils/SpriteExtent");
class MetadataReader {
    get settings() { return this._settings; }
    setSettings(value) {
        if (this._settings !== value) {
            this._settings = value;
        }
    }
    get bytesAvailable() { return this._bytes.bytesAvailable; }
    get position() { return this._bytes.position; }
    set position(value) { this._bytes.position = value; }
    constructor(bytes) {
        this._settings = null;
        this._bytes = bytes;
    }
    readUnsignedByte() { return this._bytes.readUnsignedByte(); }
    readByte() { return this._bytes.readUnsignedByte(); } // TODO: Implement signed byte
    readUnsignedShort() { return this._bytes.readUnsignedShort(); }
    readShort() { return this._bytes.readUnsignedShort(); } // TODO: Implement signed short
    readUnsignedInt() { return this._bytes.readUnsignedInt(); }
    readInt() { return this._bytes.readUnsignedInt(); } // TODO: Implement signed int
    readSignature() {
        this.position = MetadataFilePosition_1.MetadataFilePosition.SIGNATURE;
        return this.readUnsignedInt();
    }
    readItemsCount() {
        this.position = MetadataFilePosition_1.MetadataFilePosition.ITEMS_COUNT;
        return this.readUnsignedShort();
    }
    readOutfitsCount() {
        this.position = MetadataFilePosition_1.MetadataFilePosition.OUTFITS_COUNT;
        return this.readUnsignedShort();
    }
    readEffectsCount() {
        this.position = MetadataFilePosition_1.MetadataFilePosition.EFFECTS_COUNT;
        return this.readUnsignedShort();
    }
    readMissilesCount() {
        this.position = MetadataFilePosition_1.MetadataFilePosition.MISSILES_COUNT;
        return this.readUnsignedShort();
    }
    readTexturePatterns(type, extended, frameDurations, frameGroups) {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = this.readUnsignedByte();
        }
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
                this.readUnsignedByte();
            }
            const frameGroup = new FrameGroup_1.FrameGroup();
            frameGroup.type = groupType;
            frameGroup.width = this.readUnsignedByte();
            frameGroup.height = this.readUnsignedByte();
            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = this.readUnsignedByte();
            }
            else {
                frameGroup.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
            }
            frameGroup.layers = this.readUnsignedByte();
            frameGroup.patternX = this.readUnsignedByte();
            frameGroup.patternY = this.readUnsignedByte();
            frameGroup.patternZ = this.readUnsignedByte();
            frameGroup.frames = this.readUnsignedByte();
            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.frameDurations = new Array(frameGroup.frames);
                if (frameDurations && this._settings) {
                    frameGroup.animationMode = this.readUnsignedByte();
                    frameGroup.loopCount = this.readInt();
                    frameGroup.startFrame = this.readByte();
                    for (let i = 0; i < frameGroup.frames; i++) {
                        const minimum = this.readUnsignedInt();
                        const maximum = this.readUnsignedInt();
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(minimum, maximum);
                    }
                }
                else if (this._settings) {
                    const duration = this._settings.getDefaultDuration(type.category);
                    for (let i = 0; i < frameGroup.frames; i++) {
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(duration, duration);
                    }
                }
            }
            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`A thing type has more than ${SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }
            frameGroup.spriteIndex = new Array(totalSprites);
            for (let i = 0; i < totalSprites; i++) {
                if (extended) {
                    frameGroup.spriteIndex[i] = this.readUnsignedInt();
                }
                else {
                    frameGroup.spriteIndex[i] = this.readUnsignedShort();
                }
            }
            type.setFrameGroup(groupType, frameGroup);
        }
        return true;
    }
    // Note: Version-specific readers should be instantiated directly by ThingTypeStorage
    // This method is kept for convenience but may not be used
    static fromFile(filePath, version) {
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
        // Version-specific readers will be created by ThingTypeStorage
        // This is a placeholder - actual implementation should use version-specific classes
        throw new Error(`Use version-specific MetadataReader classes directly. Version ${version} not handled here.`);
    }
}
exports.MetadataReader = MetadataReader;

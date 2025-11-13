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
exports.ThingData = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const FrameGroupType_1 = require("./FrameGroupType");
const ThingCategory_1 = require("./ThingCategory");
const SpriteData_1 = require("../sprites/SpriteData");
const BitmapData_1 = require("../utils/BitmapData");
const BitmapDataChannel_1 = require("../utils/BitmapDataChannel");
const Rect_1 = require("../geom/Rect");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const SpriteUtils_1 = require("../utils/SpriteUtils");
const ColorUtils_1 = require("../utils/ColorUtils");
const OBDEncoder_1 = require("../obd/OBDEncoder");
const OBDVersions_1 = require("../obd/OBDVersions");
const OTFormat_1 = require("../utils/OTFormat");
const ByteArray_1 = require("../utils/ByteArray");
class ThingData {
    get id() { return this.m_thing ? this.m_thing.id : 0; }
    get category() { return this.m_thing ? this.m_thing.category : ""; }
    get obdVersion() { return this.m_obdVersion; }
    set obdVersion(value) {
        if (value < OBDVersions_1.OBDVersions.OBD_VERSION_1) {
            throw new Error(`Invalid obd version ${value}.`);
        }
        this.m_obdVersion = value;
    }
    get clientVersion() { return this.m_clientVersion; }
    set clientVersion(value) {
        if (value < 710) {
            throw new Error(`Invalid client version ${value}.`);
        }
        this.m_clientVersion = value;
    }
    get thing() { return this.m_thing; }
    set thing(value) {
        if (!value) {
            throw new Error("thing cannot be null");
        }
        this.m_thing = value;
    }
    get sprites() { return this.m_sprites; }
    set sprites(value) {
        if (!value || value.size === 0) {
            throw new Error("sprites cannot be null or empty");
        }
        let empty = true;
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const spritesValue = value.get(groupType);
            if (!spritesValue) {
                continue;
            }
            const length = spritesValue.length;
            for (let i = 0; i < length; i++) {
                if (spritesValue[i] === null || spritesValue[i] === undefined) {
                    throw new Error("Invalid sprite list");
                }
            }
            empty = false;
        }
        if (empty) {
            throw new Error("Invalid sprite list");
        }
        this.m_sprites = value;
    }
    constructor() {
        this.m_obdVersion = 0;
        this.m_clientVersion = 0;
        this.m_thing = null;
        this.m_sprites = new Map();
        this.m_sprites = new Map();
        this._rect = new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
    }
    getFrameGroup(groupType) {
        return this.m_thing ? this.m_thing.getFrameGroup(groupType) : null;
    }
    getSpriteSheet(frameGroup, textureIndex = null, backgroundColor = 0xFFFF00FF) {
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        const totalX = frameGroup.getTotalX();
        const totalY = frameGroup.getTotalY();
        const bitmapWidth = (totalX * frameGroup.width) * size;
        const bitmapHeight = (totalY * frameGroup.height) * size;
        const pixelsWidth = frameGroup.width * size;
        const pixelsHeight = frameGroup.height * size;
        const bitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, backgroundColor);
        if (textureIndex) {
            textureIndex.length = frameGroup.getTotalTextures();
        }
        for (let f = 0; f < frameGroup.frames; f++) {
            for (let z = 0; z < frameGroup.patternZ; z++) {
                for (let y = 0; y < frameGroup.patternY; y++) {
                    for (let x = 0; x < frameGroup.patternX; x++) {
                        for (let l = 0; l < frameGroup.layers; l++) {
                            const index = frameGroup.getTextureIndex(l, x, y, z, f);
                            const fx = (index % totalX) * pixelsWidth;
                            const fy = Math.floor(index / totalX) * pixelsHeight;
                            if (textureIndex) {
                                textureIndex[index] = new Rect_1.Rect(fx, fy, pixelsWidth, pixelsHeight);
                            }
                            for (let w = 0; w < frameGroup.width; w++) {
                                for (let h = 0; h < frameGroup.height; h++) {
                                    const spriteIndex = frameGroup.getSpriteIndex(w, h, l, x, y, z, f);
                                    const px = ((frameGroup.width - w - 1) * size);
                                    const py = ((frameGroup.height - h - 1) * size);
                                    this.copyPixels(frameGroup.type, spriteIndex, bitmap, px + fx, py + fy);
                                }
                            }
                        }
                    }
                }
            }
        }
        return bitmap;
    }
    getTotalSpriteSheet(textureIndex = null, backgroundColor = 0xFFFF00FF) {
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        let totalX = 0;
        let totalY = 0;
        const totalGroupY = [];
        let width = 0;
        let height = 0;
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = this.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            const _totalX = frameGroup.getTotalX();
            if (totalX < _totalX) {
                totalX = _totalX;
            }
            totalGroupY[groupType] = frameGroup.getTotalY();
            totalY += totalGroupY[groupType];
            if (width < frameGroup.width) {
                width = frameGroup.width;
            }
            if (height < frameGroup.height) {
                height = frameGroup.height;
            }
        }
        const bitmapWidth = (totalX * width) * size;
        const bitmapHeight = (totalY * height) * size;
        const pixelsHeight = height * size;
        const pixelsWidth = width * size;
        const bitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, backgroundColor);
        let defaultY = 0;
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = this.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            if (textureIndex) {
                textureIndex.length = frameGroup.getTotalTextures();
            }
            for (let f = 0; f < frameGroup.frames; f++) {
                for (let z = 0; z < frameGroup.patternZ; z++) {
                    for (let y = 0; y < frameGroup.patternY; y++) {
                        for (let x = 0; x < frameGroup.patternX; x++) {
                            for (let l = 0; l < frameGroup.layers; l++) {
                                const index = frameGroup.getTextureIndex(l, x, y, z, f);
                                const fx = (index % totalX) * pixelsWidth;
                                let fy = Math.floor(index / totalX) * pixelsHeight;
                                if (frameGroup.type === FrameGroupType_1.FrameGroupType.WALKING) {
                                    fy += totalGroupY[FrameGroupType_1.FrameGroupType.DEFAULT] * pixelsHeight;
                                }
                                if (textureIndex) {
                                    textureIndex[index] = new Rect_1.Rect(fx, fy, pixelsWidth, pixelsHeight);
                                }
                                for (let w = 0; w < frameGroup.width; w++) {
                                    for (let h = 0; h < frameGroup.height; h++) {
                                        const spriteIndex = frameGroup.getSpriteIndex(w, h, l, x, y, z, f);
                                        const px = ((frameGroup.width - w - 1) * size);
                                        const py = ((frameGroup.height - h - 1) * size);
                                        this.copyPixels(frameGroup.type, spriteIndex, bitmap, px + fx, py + fy);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return bitmap;
    }
    getColoredSpriteSheet(frameGroup, outfitData) {
        if (!outfitData) {
            throw new Error("outfitData cannot be null");
        }
        const textureRectList = [];
        let spriteSheet = this.getSpriteSheet(frameGroup, textureRectList, 0x00000000);
        spriteSheet = SpriteUtils_1.SpriteUtils.removeMagenta(spriteSheet);
        if (frameGroup.layers < 2) {
            return spriteSheet;
        }
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        const totalX = frameGroup.getTotalX();
        const totalY = frameGroup.height;
        const pixelsWidth = frameGroup.width * size;
        const pixelsHeight = frameGroup.height * size;
        const bitmapWidth = frameGroup.patternZ * frameGroup.patternX * pixelsWidth;
        const bitmapHeight = frameGroup.frames * pixelsHeight;
        const grayBitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, 0);
        const blendBitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, 0);
        const colorBitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, 0);
        const bitmap = new BitmapData_1.BitmapData(bitmapWidth, bitmapHeight, true, 0);
        const bitmapRect = bitmap.rect;
        const rectList = new Array(frameGroup.getTotalTextures());
        for (let f = 0; f < frameGroup.frames; f++) {
            for (let z = 0; z < frameGroup.patternZ; z++) {
                for (let x = 0; x < frameGroup.patternX; x++) {
                    const index = (((f % frameGroup.frames * frameGroup.patternZ + z) * frameGroup.patternY + 0) * frameGroup.patternX + x) * frameGroup.layers;
                    rectList[index] = new Rect_1.Rect((z * frameGroup.patternX + x) * pixelsWidth, f * pixelsHeight, pixelsWidth, pixelsHeight);
                }
            }
        }
        for (let y = 0; y < frameGroup.patternY; y++) {
            if (y === 0 || (outfitData.addons & (1 << (y - 1))) !== 0) {
                for (let f = 0; f < frameGroup.frames; f++) {
                    for (let z = 0; z < frameGroup.patternZ; z++) {
                        for (let x = 0; x < frameGroup.patternX; x++) {
                            let i = (((f % frameGroup.frames * frameGroup.patternZ + z) * frameGroup.patternY + y) * frameGroup.patternX + x) * frameGroup.layers;
                            let rect = textureRectList[i];
                            this._rect.setTo(rect.x, rect.y, rect.width, rect.height);
                            const index = (((f * frameGroup.patternZ + z) * frameGroup.patternY) * frameGroup.patternX + x) * frameGroup.layers;
                            rect = rectList[index];
                            grayBitmap.copyPixels(spriteSheet, this._rect, { x: rect.x, y: rect.y });
                            i++;
                            rect = textureRectList[i];
                            this._rect.setTo(rect.x, rect.y, rect.width, rect.height);
                            blendBitmap.copyPixels(spriteSheet, this._rect, { x: rect.x, y: rect.y });
                        }
                    }
                }
                this.setColor(colorBitmap, grayBitmap, blendBitmap, bitmapRect, BitmapDataChannel_1.BitmapDataChannel.BLUE, ColorUtils_1.ColorUtils.HSItoARGB(outfitData.feet));
                blendBitmap.applyFilter(blendBitmap, bitmapRect, { x: 0, y: 0 }, null);
                this.setColor(colorBitmap, grayBitmap, blendBitmap, bitmapRect, BitmapDataChannel_1.BitmapDataChannel.BLUE, ColorUtils_1.ColorUtils.HSItoARGB(outfitData.head));
                this.setColor(colorBitmap, grayBitmap, blendBitmap, bitmapRect, BitmapDataChannel_1.BitmapDataChannel.RED, ColorUtils_1.ColorUtils.HSItoARGB(outfitData.body));
                this.setColor(colorBitmap, grayBitmap, blendBitmap, bitmapRect, BitmapDataChannel_1.BitmapDataChannel.GREEN, ColorUtils_1.ColorUtils.HSItoARGB(outfitData.legs));
                bitmap.copyPixels(grayBitmap, bitmapRect, { x: 0, y: 0 }, null, null, true);
            }
        }
        grayBitmap.dispose();
        blendBitmap.dispose();
        colorBitmap.dispose();
        return bitmap;
    }
    setSpriteSheet(frameGroup, bitmap) {
        if (!bitmap) {
            throw new Error("bitmap cannot be null");
        }
        const ss = frameGroup.getSpriteSheetSize();
        if (bitmap.width !== ss.width || bitmap.height !== ss.height) {
            return;
        }
        bitmap = SpriteUtils_1.SpriteUtils.removeMagenta(bitmap);
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        const totalX = frameGroup.getTotalX();
        const pixelsWidth = frameGroup.width * size;
        const pixelsHeight = frameGroup.height * size;
        for (let f = 0; f < frameGroup.frames; f++) {
            for (let z = 0; z < frameGroup.patternZ; z++) {
                for (let y = 0; y < frameGroup.patternY; y++) {
                    for (let x = 0; x < frameGroup.patternX; x++) {
                        for (let l = 0; l < frameGroup.layers; l++) {
                            const index = frameGroup.getTextureIndex(l, x, y, z, f);
                            const fx = (index % totalX) * pixelsWidth;
                            const fy = Math.floor(index / totalX) * pixelsHeight;
                            for (let w = 0; w < frameGroup.width; w++) {
                                for (let h = 0; h < frameGroup.height; h++) {
                                    const spriteIndex = frameGroup.getSpriteIndex(w, h, l, x, y, z, f);
                                    const px = ((frameGroup.width - w - 1) * size);
                                    const py = ((frameGroup.height - h - 1) * size);
                                    this._rect.setTo(px + fx, py + fy, size, size);
                                    const bmp = new BitmapData_1.BitmapData(size, size, true, 0x00000000);
                                    bmp.copyPixels(bitmap, this._rect, { x: 0, y: 0 });
                                    const sd = new SpriteData_1.SpriteData();
                                    const pixelBuffer = bmp.getPixels(bmp.rect);
                                    sd.pixels = Buffer.from(pixelBuffer);
                                    sd.id = 0xFFFFFFFF;
                                    const sprites = this.m_sprites.get(frameGroup.type) || [];
                                    sprites[spriteIndex] = sd;
                                    this.m_sprites.set(frameGroup.type, sprites);
                                    if (frameGroup.spriteIndex) {
                                        frameGroup.spriteIndex[spriteIndex] = sd.id;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    colorize(outfitData) {
        if (!outfitData) {
            throw new Error("outfitData cannot be null");
        }
        if (this.m_thing && this.m_thing.category !== ThingCategory_1.ThingCategory.OUTFIT) {
            return this;
        }
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = this.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            const bitmap = this.getColoredSpriteSheet(frameGroup, outfitData);
            this.setSpriteSheet(frameGroup, bitmap);
        }
        return this;
    }
    getBitmap(frameGroup, layer = 0, patternX = 0, patternY = 0, patternZ = 0, frame = 0) {
        layer %= frameGroup.layers;
        patternX %= frameGroup.patternX;
        patternY %= frameGroup.patternY;
        patternZ %= frameGroup.patternZ;
        frame %= frameGroup.frames;
        const rects = [];
        const spriteSheet = this.getSpriteSheet(frameGroup, rects, 0);
        const index = frameGroup.getTextureIndex(layer, patternX, patternY, patternZ, frame);
        let bitmap = null;
        if (index < rects.length) {
            const rect = rects[index];
            bitmap = new BitmapData_1.BitmapData(rect.width, rect.height, true, 0);
            this._rect.setTo(rect.x, rect.y, rect.width, rect.height);
            bitmap.copyPixels(spriteSheet, this._rect, { x: 0, y: 0 });
        }
        spriteSheet.dispose();
        return bitmap;
    }
    clone() {
        const td = new ThingData();
        td.m_obdVersion = this.m_obdVersion;
        td.m_clientVersion = this.m_clientVersion;
        td.m_thing = this.m_thing ? this.m_thing.clone() : null;
        td.m_sprites = new Map();
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const sprites = this.m_sprites.get(groupType);
            if (!sprites) {
                continue;
            }
            const length = sprites.length;
            const clonedSprites = new Array(length);
            for (let i = 0; i < length; i++) {
                clonedSprites[i] = sprites[i].clone();
            }
            td.m_sprites.set(groupType, clonedSprites);
        }
        return td;
    }
    copyPixels(groupType, index, bitmap, x, y) {
        const sprites = this.m_sprites.get(groupType);
        if (!sprites) {
            return;
        }
        if (index < sprites.length) {
            const sd = sprites[index];
            if (sd && sd.pixels) {
                const bmp = sd.getBitmap();
                if (bmp) {
                    // sd.pixels is Buffer, not ByteArray, so no position property needed
                    this._rect.setTo(0, 0, bmp.width, bmp.height);
                    bitmap.copyPixels(bmp, this._rect, { x, y }, null, null, true);
                }
            }
        }
    }
    setColor(canvas, grey, blend, rect, channel, color) {
        const redMultiplier = ((color >> 16) & 0xFF) / 0xFF;
        const greenMultiplier = ((color >> 8) & 0xFF) / 0xFF;
        const blueMultiplier = (color & 0xFF) / 0xFF;
        canvas.copyPixels(grey, rect, { x: 0, y: 0 });
        canvas.copyChannel(blend, rect, { x: 0, y: 0 }, channel, BitmapDataChannel_1.BitmapDataChannel.ALPHA);
        canvas.colorTransform(rect, { redMultiplier, greenMultiplier, blueMultiplier });
        grey.copyPixels(canvas, rect, { x: 0, y: 0 }, null, null, true);
    }
    addFrameGroupSprites() {
        const spritesGroup = new Map();
        const defaultSprites = this.m_sprites.get(FrameGroupType_1.FrameGroupType.DEFAULT) || [];
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = this.m_thing?.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            const _length = frameGroup.spriteIndex ? frameGroup.spriteIndex.length : 0;
            const sprites = new Array(_length);
            for (const spriteData of defaultSprites) {
                if (!frameGroup.spriteIndex)
                    continue;
                for (let index = 0; index < _length; index++) {
                    const spriteIndex = frameGroup.spriteIndex[index];
                    if (spriteIndex === spriteData.id) {
                        sprites[index] = spriteData.clone();
                    }
                }
            }
            spritesGroup.set(groupType, sprites);
        }
        this.m_sprites = spritesGroup;
    }
    removeFrameGroupSprites() {
        const spritesGroup = new Map();
        const frameGroup = this.m_thing?.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        if (!frameGroup || !frameGroup.spriteIndex) {
            return;
        }
        const _length = frameGroup.spriteIndex.length;
        const sprites = new Array(_length);
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const groupSprites = this.m_sprites.get(groupType) || [];
            for (const spriteData of groupSprites) {
                for (let index = 0; index < _length; index++) {
                    if (frameGroup.spriteIndex[index] === spriteData.id) {
                        sprites[index] = spriteData.clone();
                    }
                }
            }
        }
        spritesGroup.set(FrameGroupType_1.FrameGroupType.DEFAULT, sprites);
        this.m_sprites = spritesGroup;
    }
    static create(obdVersion, clientVersion, thing, sprites) {
        if (obdVersion < OBDVersions_1.OBDVersions.OBD_VERSION_1) {
            throw new Error(`Invalid OBD version ${obdVersion}`);
        }
        if (clientVersion < 710) {
            throw new Error(`Invalid client version ${clientVersion}`);
        }
        if (!thing) {
            throw new Error("thing cannot be null");
        }
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        let spritesLength = 0;
        let spriteIndexLength = 0;
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = thing.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            spriteIndexLength += frameGroup.spriteIndex ? frameGroup.spriteIndex.length : 0;
            const groupSprites = sprites.get(groupType);
            spritesLength += groupSprites ? groupSprites.length : 0;
        }
        if (spriteIndexLength !== spritesLength) {
            throw new Error("Invalid sprites length.");
        }
        const thingData = new ThingData();
        thingData.obdVersion = obdVersion;
        thingData.clientVersion = clientVersion;
        thingData.thing = thing;
        thingData.sprites = sprites;
        return thingData;
    }
    static async createFromFile(filePath, settings) {
        const ext = path.extname(filePath).toLowerCase().substring(1);
        if (!filePath || ext !== OTFormat_1.OTFormat.OBD || !fs.existsSync(filePath) || !settings) {
            return null;
        }
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
        const encoder = new OBDEncoder_1.OBDEncoder(settings);
        return await encoder.decode(bytes);
    }
}
exports.ThingData = ThingData;

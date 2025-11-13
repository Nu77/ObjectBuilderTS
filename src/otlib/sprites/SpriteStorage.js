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
exports.SpriteStorage = void 0;
const events_1 = require("events");
const StorageEvent_1 = require("../storages/events/StorageEvent");
const ChangeResult_1 = require("../utils/ChangeResult");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const Sprite_1 = require("./Sprite");
const SpriteUtils_1 = require("../utils/SpriteUtils");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const BitmapData_1 = require("../utils/BitmapData");
const Rect_1 = require("../geom/Rect");
const Resources_1 = require("../resources/Resources");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ByteArray_1 = require("../utils/ByteArray");
const SpriteReader_1 = require("./SpriteReader");
const SpriteFileSize_1 = require("./SpriteFileSize");
class SpriteStorage extends events_1.EventEmitter {
    get file() { return this._file; }
    get version() { return this._version; }
    get signature() { return this._signature; }
    get spritesCount() { return this._spritesCount; }
    get loaded() { return this._loaded; }
    get changed() { return this._changed; }
    get isFull() { return (!this._extended && this._spritesCount === 0xFFFF); }
    get transparency() { return this._transparency; }
    get alertSprite() { return this._alertSprite; }
    get isTemporary() { return (this._loaded && this._file === null); }
    constructor() {
        super();
        this._sprites = new Map();
        this._spritesCount = 0;
        this._file = null;
        this._reader = null;
        this._version = null;
        this._signature = 0;
        this._extended = false;
        this._transparency = false;
        this._blankSprite = null;
        this._alertSprite = null;
        this._headerSize = 0;
        this._changed = false;
        this._loaded = false;
        this._rect = new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
    }
    load(filePath, version, extended, transparency) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (this.loaded) {
            return;
        }
        this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.SPRITES, 0, 100));
        this.onLoad(filePath, version, extended, transparency, false);
    }
    createNew(version, extended, transparency) {
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (this.loaded)
            return;
        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._signature = version.sprSignature;
        this._spritesCount = 1;
        this._headerSize = this._extended ? SpriteFileSize_1.SpriteFileSize.HEADER_U32 : SpriteFileSize_1.SpriteFileSize.HEADER_U16;
        this._transparency = transparency;
        this._blankSprite = new Sprite_1.Sprite(0, transparency);
        this._alertSprite = this.createAlertSprite(transparency);
        this._sprites = new Map();
        this._sprites.set(0, this._blankSprite);
        this._sprites.set(1, new Sprite_1.Sprite(1, transparency));
        this._changed = false;
        this._loaded = true;
        this.emit(StorageEvent_1.StorageEvent.LOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.LOAD));
    }
    addSprite(pixels) {
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }
        const result = this.internalAddSprite(pixels);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    addSprites(sprites) {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        const result = this.internalAddSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    replaceSprite(id, pixels) {
        if (id === 0 || id > this._spritesCount) {
            throw new Error(Resources_1.Resources.getString("indexOutOfRange"));
        }
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray_1.ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        if (pixelBuffer.length !== SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error("Parameter pixels has an invalid length.");
        }
        const result = this.internalReplaceSprite(id, pixels);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    replaceSprites(sprites) {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        const result = this.internalReplaceSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    removeSprite(id) {
        if (id === 0 || id > this._spritesCount) {
            throw new Error(Resources_1.Resources.getString("indexOutOfRange"));
        }
        const result = this.internalRemoveSprite(id);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    removeSprites(sprites) {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        const result = this.internalRemoveSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    getSprite(id) {
        if (id === 0xFFFFFFFF)
            return this._alertSprite;
        if (this._loaded && id <= this._spritesCount) {
            let sprite = null;
            if (this._sprites.has(id)) {
                sprite = this._sprites.get(id);
            }
            else {
                sprite = this.readSprite(id);
            }
            if (!sprite) {
                sprite = this._blankSprite;
            }
            return sprite;
        }
        return null;
    }
    getPixels(id) {
        if (this._loaded) {
            const sprite = this.getSprite(id);
            if (sprite) {
                try {
                    const pixels = sprite.getPixels();
                    return pixels instanceof Buffer ? pixels : pixels.toBuffer();
                }
                catch (error) {
                    // Log.error(Resources.getString("failedToGetSprite", id));
                    const alertPixels = this._alertSprite?.getPixels();
                    return alertPixels ? (alertPixels instanceof Buffer ? alertPixels : alertPixels.toBuffer()) : null;
                }
            }
        }
        return null;
    }
    copyPixels(id, bitmap, x, y) {
        if (!this.loaded || !bitmap)
            return;
        try {
            const sprite = this.getBitmap(id, true);
            if (!sprite)
                return;
            bitmap.copyPixels(sprite, this._rect, { x, y }, null, null, true);
        }
        catch (error) {
            const alertBitmap = SpriteUtils_1.SpriteUtils.createAlertBitmap();
            bitmap.copyPixels(alertBitmap, this._rect, { x, y }, null, null, true);
            // Log.error(Resources.getString("failedToGetSprite", id));
        }
    }
    getBitmap(id, transparent) {
        if (!this.loaded || id === 0) {
            return null;
        }
        const sprite = this.getSprite(id);
        if (!sprite) {
            return null;
        }
        let bitmap = sprite.getBitmap();
        if (!transparent && bitmap) {
            bitmap = SpriteUtils_1.SpriteUtils.fillBackground(bitmap);
        }
        return bitmap;
    }
    hasSpriteId(id) {
        if (this._loaded && id <= this._spritesCount) {
            return true;
        }
        return false;
    }
    compare(id, pixels) {
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray_1.ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        if (pixelBuffer.length !== SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error("Parameter pixels has an invalid length.");
        }
        if (this.hasSpriteId(id)) {
            const bmp1 = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
            bmp1.setPixels(bmp1.rect, pixelBuffer);
            const otherPixels = this.getPixels(id);
            if (otherPixels) {
                const bmp2 = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
                bmp2.setPixels(bmp2.rect, otherPixels);
                // TODO: Implement bitmap comparison
                return true; // Placeholder
            }
        }
        return false;
    }
    compile(filePath, version, extended, transparency) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (!this._loaded) {
            return false;
        }
        extended = (extended || version.value >= 960);
        const equal = (this._file === filePath);
        // If is unmodified and the version is equal only save raw bytes.
        if (!this.isTemporary &&
            !this._changed &&
            this._version &&
            this._version.equals(version) &&
            this._extended === extended &&
            this._transparency === transparency) {
            if (!equal && this._file) {
                fs.copyFileSync(this._file, filePath);
            }
            this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.SPRITES, this._spritesCount, this._spritesCount));
            return true;
        }
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const tmpFilePath = path.join(dir, "tmp_" + fileName);
        let done = false;
        let headSize;
        let count;
        try {
            // Build sprite data first
            const spriteData = [];
            const dispatchProgress = this.listenerCount(ProgressEvent_1.ProgressEvent.PROGRESS) > 0;
            // Calculate sprite count
            if (extended || version.value >= 960) {
                count = this._spritesCount;
                headSize = SpriteFileSize_1.SpriteFileSize.HEADER_U32;
            }
            else {
                count = this._spritesCount >= 0xFFFF ? 0xFFFE : this._spritesCount;
                headSize = SpriteFileSize_1.SpriteFileSize.HEADER_U16;
            }
            // Collect sprite data
            for (let i = 1; i <= count; i++) {
                const sprite = this.getSprite(i);
                if (!sprite || sprite.isEmpty) {
                    spriteData.push({ address: 0, data: null });
                }
                else {
                    sprite.transparent = transparency;
                    sprite.compressedPixels.position = 0;
                    // Build sprite data buffer
                    const spriteBuffer = Buffer.alloc(5 + sprite.length); // 3 color bytes + 2 size bytes + data
                    spriteBuffer.writeUInt8(0xFF, 0); // red
                    spriteBuffer.writeUInt8(0x00, 1); // blue
                    spriteBuffer.writeUInt8(0xFF, 2); // green
                    spriteBuffer.writeUInt16LE(sprite.length, 3); // size
                    if (sprite.length > 0) {
                        sprite.compressedPixels.toBuffer().copy(spriteBuffer, 5);
                    }
                    spriteData.push({ address: 0, data: spriteBuffer });
                }
                if (dispatchProgress && (i % 10) === 0) {
                    this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.SPRITES, i, count));
                }
            }
            // Calculate addresses
            let offset = headSize + (count * SpriteFileSize_1.SpriteFileSize.ADDRESS);
            for (let i = 0; i < spriteData.length; i++) {
                if (spriteData[i].data) {
                    spriteData[i].address = offset;
                    offset += spriteData[i].data.length;
                }
            }
            // Build final buffer
            const headerBuffer = Buffer.alloc(headSize);
            headerBuffer.writeUInt32LE(version.sprSignature, 0);
            if (extended || version.value >= 960) {
                headerBuffer.writeUInt32LE(count, 4);
            }
            else {
                headerBuffer.writeUInt16LE(count, 4);
            }
            const addressTableBuffer = Buffer.alloc(count * SpriteFileSize_1.SpriteFileSize.ADDRESS);
            for (let i = 0; i < count; i++) {
                addressTableBuffer.writeUInt32LE(spriteData[i].address, i * SpriteFileSize_1.SpriteFileSize.ADDRESS);
            }
            // Combine all buffers
            const spriteBuffers = [headerBuffer, addressTableBuffer];
            for (const sprite of spriteData) {
                if (sprite.data) {
                    spriteBuffers.push(sprite.data);
                }
            }
            const finalBuffer = Buffer.concat(spriteBuffers);
            // Write to temporary file
            fs.writeFileSync(tmpFilePath, finalBuffer);
            done = true;
        }
        catch (error) {
            this.emit("error", new Error(error.message || error));
            done = false;
        }
        if (done) {
            // Delete old file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            // Rename temporary file
            fs.renameSync(tmpFilePath, filePath);
            this._file = filePath;
            // Reload if equal
            if (equal) {
                this.onLoad(filePath, version, extended, transparency, true);
            }
            this._changed = false;
        }
        else if (fs.existsSync(tmpFilePath)) {
            fs.unlinkSync(tmpFilePath);
        }
        this.emit(StorageEvent_1.StorageEvent.COMPILE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.COMPILE));
        this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        return done;
    }
    isEmptySprite(id) {
        if (this._loaded && id <= this._spritesCount) {
            if (this._sprites.has(id)) {
                return this._sprites.get(id).isEmpty;
            }
            else if (this._reader) {
                return this._reader.isEmptySprite(id);
            }
        }
        return true;
    }
    invalidate() {
        if (!this._changed) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
    }
    unload() {
        this._reader = null;
        this._file = null;
        this._version = null;
        this._sprites.clear();
        this._spritesCount = 0;
        this._signature = 0;
        this._extended = false;
        this._transparency = false;
        this._blankSprite = null;
        this._alertSprite = null;
        this._headerSize = 0;
        this._changed = false;
        this._loaded = false;
        this.emit(StorageEvent_1.StorageEvent.UNLOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.UNLOAD));
        this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
    }
    // Private methods
    onLoad(filePath, version, extended, transparency, reloading) {
        if (!fs.existsSync(filePath)) {
            // Log.error(Resources.getString("fileNotFound", filePath));
            return;
        }
        this._file = filePath;
        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._transparency = transparency;
        this._reader = SpriteReader_1.SpriteReader.fromFile(filePath, this._extended, transparency);
        this._signature = this._reader.readSignature();
        this._spritesCount = this._reader.readSpriteCount();
        this._headerSize = this._extended ? SpriteFileSize_1.SpriteFileSize.HEADER_U32 : SpriteFileSize_1.SpriteFileSize.HEADER_U16;
        this._blankSprite = new Sprite_1.Sprite(0, transparency);
        this._alertSprite = this.createAlertSprite(transparency);
        this._sprites = new Map();
        this._sprites.set(0, this._blankSprite);
        this._changed = false;
        this._loaded = true;
        if (!reloading) {
            this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.SPRITES, this._spritesCount, this._spritesCount));
            this.emit(StorageEvent_1.StorageEvent.LOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.LOAD));
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
    }
    createAlertSprite(transparency) {
        // TODO: Create alert sprite from assets
        return new Sprite_1.Sprite(0xFFFFFFFF, transparency);
    }
    readSprite(id) {
        try {
            if (this._reader) {
                return this._reader.readSprite(id);
            }
            return this._alertSprite;
        }
        catch (error) {
            // Log.error(Resources.getString("failedToGetSprite", id));
            return this._alertSprite;
        }
    }
    internalAddSprite(pixels) {
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray_1.ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        this._spritesCount++;
        const sprite = new Sprite_1.Sprite(this._spritesCount, this._transparency);
        sprite.setPixels(ByteArray_1.ByteArray.fromBuffer(pixelBuffer));
        this._sprites.set(this._spritesCount, sprite);
        return new ChangeResult_1.ChangeResult([sprite], true);
    }
    internalAddSprites(sprites) {
        const added = [];
        for (const pixels of sprites) {
            const result = this.internalAddSprite(pixels);
            if (result.list) {
                added.push(...result.list);
            }
        }
        return new ChangeResult_1.ChangeResult(added, true);
    }
    internalReplaceSprite(id, pixels) {
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray_1.ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        const oldSprite = this._sprites.get(id);
        const sprite = new Sprite_1.Sprite(id, this._transparency);
        sprite.setPixels(ByteArray_1.ByteArray.fromBuffer(pixelBuffer));
        this._sprites.set(id, sprite);
        return new ChangeResult_1.ChangeResult([oldSprite], true);
    }
    internalReplaceSprites(sprites) {
        const replaced = [];
        for (const spriteData of sprites) {
            const oldSprite = this._sprites.get(spriteData.id);
            const sprite = new Sprite_1.Sprite(spriteData.id, this._transparency);
            if (spriteData.pixels) {
                sprite.setPixels(ByteArray_1.ByteArray.fromBuffer(spriteData.pixels));
            }
            this._sprites.set(spriteData.id, sprite);
            if (oldSprite) {
                replaced.push(oldSprite);
            }
        }
        return new ChangeResult_1.ChangeResult(replaced, true);
    }
    internalRemoveSprite(id) {
        const sprite = this._sprites.get(id);
        if (sprite) {
            this._sprites.delete(id);
            return new ChangeResult_1.ChangeResult([sprite], true);
        }
        return new ChangeResult_1.ChangeResult(null, false, "Sprite not found");
    }
    internalRemoveSprites(sprites) {
        const removed = [];
        sprites.sort((a, b) => b - a); // Sort descending
        for (const id of sprites) {
            if (this._sprites.has(id)) {
                const sprite = this._sprites.get(id);
                this._sprites.delete(id);
                removed.push(sprite);
            }
        }
        return new ChangeResult_1.ChangeResult(removed, true);
    }
}
exports.SpriteStorage = SpriteStorage;

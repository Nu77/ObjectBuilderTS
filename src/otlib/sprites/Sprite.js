"use strict";

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
exports.Sprite = void 0;
const crypto = __importStar(require("crypto"));
const BitmapData_1 = require("../utils/BitmapData");
const Rect_1 = require("../geom/Rect");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const ByteArray_1 = require("../utils/ByteArray");
class Sprite {
    get id() { return this._id; }
    set id(value) { this._id = value; }
    get transparent() { return this._transparent; }
    set transparent(value) {
        if (this._transparent !== value) {
            const pixels = this.getPixels();
            this._transparent = value;
            this.setPixels(pixels);
        }
    }
    get isEmpty() { return (this._compressedPixels.length === 0); }
    get length() { return this._compressedPixels.length; }
    get compressedPixels() { return this._compressedPixels; }
    set compressedPixels(value) { this._compressedPixels = value; }
    constructor(id, transparent) {
        this._bitmap = null;
        this._hash = null;
        this._id = id;
        this._transparent = transparent;
        this._compressedPixels = new ByteArray_1.ByteArray();
        this._rect = new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE);
    }
    toString() {
        return this._id.toString();
    }
    getPixels() {
        return this.uncompressPixels();
    }
    setPixels(pixels) {
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }
        if (pixels.length !== SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error("Invalid sprite pixels length");
        }
        this._hash = null;
        return this.compressPixels(pixels);
    }
    getBitmap() {
        if (this._bitmap) {
            return this._bitmap;
        }
        const pixels = this.getPixels();
        if (!pixels) {
            return null;
        }
        this._bitmap = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, true);
        this._bitmap.setPixels(this._rect, pixels.toBuffer());
        return this._bitmap;
    }
    setBitmap(bitmap) {
        if (!bitmap) {
            throw new Error("bitmap cannot be null");
        }
        if (bitmap.width !== SpriteExtent_1.SpriteExtent.DEFAULT_SIZE || bitmap.height !== SpriteExtent_1.SpriteExtent.DEFAULT_SIZE) {
            throw new Error("Invalid sprite bitmap size");
        }
        const pixels = ByteArray_1.ByteArray.fromBuffer(bitmap.getPixels(this._rect));
        if (!this.compressPixels(pixels)) {
            return false;
        }
        this._hash = null;
        this._bitmap = bitmap.clone();
        return true;
    }
    getHash() {
        if (this._hash !== null) {
            return this._hash;
        }
        if (this._compressedPixels.length !== 0) {
            const buffer = this._compressedPixels.toBuffer();
            this._hash = crypto.createHash("md5").update(buffer).digest("hex");
        }
        return this._hash || "";
    }
    clone() {
        const sprite = new Sprite(this._id, this._transparent);
        const buffer = this._compressedPixels.toBuffer();
        sprite._compressedPixels = ByteArray_1.ByteArray.fromBuffer(buffer);
        sprite._bitmap = this._bitmap;
        return sprite;
    }
    clear() {
        if (this._compressedPixels) {
            this._compressedPixels.clear();
        }
        if (this._bitmap) {
            this._bitmap.fillRect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, 0x00FF00FF);
        }
    }
    dispose() {
        if (this._compressedPixels) {
            this._compressedPixels.clear();
        }
        if (this._bitmap) {
            this._bitmap.dispose();
            this._bitmap = null;
        }
        this._id = 0;
    }
    compressPixels(pixels) {
        this._compressedPixels.clear();
        pixels.position = 0;
        let index = 0;
        let color;
        let transparentPixel = true;
        let alphaCount = 0;
        let chunkSize = 0;
        let coloredPos = 0;
        let finishOffset = 0;
        const length = pixels.length / 4;
        while (index < length) {
            chunkSize = 0;
            while (index < length) {
                pixels.position = index * 4;
                color = pixels.readUnsignedInt();
                transparentPixel = (color === 0);
                if (!transparentPixel)
                    break;
                alphaCount++;
                chunkSize++;
                index++;
            }
            // Entire image is transparent
            if (alphaCount < length) {
                // Already at the end
                if (index < length) {
                    this._compressedPixels.writeShort(chunkSize); // Write transparent pixels
                    coloredPos = this._compressedPixels.position; // Save colored position
                    this._compressedPixels.position += 2; // Skip colored short
                    chunkSize = 0;
                    while (index < length) {
                        pixels.position = index * 4;
                        color = pixels.readUnsignedInt();
                        transparentPixel = (color === 0);
                        if (transparentPixel)
                            break;
                        this._compressedPixels.writeByte((color >> 16) & 0xFF); // Write red
                        this._compressedPixels.writeByte((color >> 8) & 0xFF); // Write green
                        this._compressedPixels.writeByte(color & 0xFF); // Write blue
                        if (this._transparent) {
                            this._compressedPixels.writeByte((color >> 24) & 0xFF); // Write Alpha
                        }
                        chunkSize++;
                        index++;
                    }
                    finishOffset = this._compressedPixels.position;
                    this._compressedPixels.position = coloredPos; // Go back to chunksize indicator
                    this._compressedPixels.writeShort(chunkSize); // Write colored pixels
                    this._compressedPixels.position = finishOffset;
                }
            }
        }
        return true;
    }
    uncompressPixels() {
        let read = 0;
        let write = 0;
        let transparentPixels;
        let coloredPixels;
        let alpha;
        let red;
        let green;
        let blue;
        const channels = this._transparent ? 4 : 3;
        const length = this._compressedPixels.length;
        this._compressedPixels.position = 0;
        const pixels = new ByteArray_1.ByteArray();
        for (read = 0; read < length; read += 4 + (channels * coloredPixels)) {
            transparentPixels = this._compressedPixels.readUnsignedShort();
            coloredPixels = this._compressedPixels.readUnsignedShort();
            for (let i = 0; i < transparentPixels; i++) {
                pixels.writeByte(0x00); // Alpha
                pixels.writeByte(0x00); // Red
                pixels.writeByte(0x00); // Green
                pixels.writeByte(0x00); // Blue
            }
            for (let i = 0; i < coloredPixels; i++) {
                red = this._compressedPixels.readUnsignedByte(); // Red
                green = this._compressedPixels.readUnsignedByte(); // Green
                blue = this._compressedPixels.readUnsignedByte(); // Blue
                alpha = this._transparent ? this._compressedPixels.readUnsignedByte() : 0xFF; // Alpha
                pixels.writeByte(alpha); // Alpha
                pixels.writeByte(red); // Red
                pixels.writeByte(green); // Green
                pixels.writeByte(blue); // Blue
            }
        }
        while (write < SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
            pixels.writeByte(0x00); // Alpha
            pixels.writeByte(0x00); // Red
            pixels.writeByte(0x00); // Green
            pixels.writeByte(0x00); // Blue
            write += 4;
        }
        return pixels;
    }
}
exports.Sprite = Sprite;

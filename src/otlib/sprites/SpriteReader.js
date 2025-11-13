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
exports.SpriteReader = void 0;
const fs = __importStar(require("fs"));
const ByteArray_1 = require("../utils/ByteArray");
const Sprite_1 = require("./Sprite");
const SpriteFilePosition_1 = require("./SpriteFilePosition");
const SpriteFileSize_1 = require("./SpriteFileSize");
class SpriteReader {
    get bytesAvailable() {
        return this._bytes.length - this._position;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    constructor(extended, transparency, bytes) {
        this._position = 0;
        this.m_extended = extended;
        this.m_transparency = transparency;
        this.m_headerSize = extended ? SpriteFileSize_1.SpriteFileSize.HEADER_U32 : SpriteFileSize_1.SpriteFileSize.HEADER_U16;
        this._bytes = bytes || new ByteArray_1.ByteArray();
    }
    readUnsignedByte() {
        const value = this._bytes.buffer.readUInt8(this._position);
        this._position++;
        return value;
    }
    readUnsignedShort() {
        const value = this._bytes.buffer.readUInt16LE(this._position);
        this._position += 2;
        return value;
    }
    readUnsignedInt() {
        const value = this._bytes.buffer.readUInt32LE(this._position);
        this._position += 4;
        return value;
    }
    readBytes(bytes, offset, length) {
        const data = this._bytes.buffer.slice(this._position, this._position + length);
        const existingBuffer = bytes.toBuffer();
        const targetBuffer = Buffer.alloc(Math.max(existingBuffer.length, offset + length));
        existingBuffer.copy(targetBuffer);
        data.copy(targetBuffer, offset);
        // Update the ByteArray's internal buffer
        bytes.buffer = targetBuffer;
        this._position += length;
    }
    readSignature() {
        this.position = SpriteFilePosition_1.SpriteFilePosition.SIGNATURE;
        return this.readUnsignedInt();
    }
    readSpriteCount() {
        this.position = SpriteFilePosition_1.SpriteFilePosition.LENGTH;
        return this.m_extended ? this.readUnsignedInt() : this.readUnsignedShort();
    }
    readSprite(id) {
        this.position = ((id - 1) * SpriteFileSize_1.SpriteFileSize.ADDRESS) + this.m_headerSize;
        const address = this.readUnsignedInt();
        if (address === 0) {
            return null;
        }
        this.position = address;
        this.readUnsignedByte(); // skip red color
        this.readUnsignedByte(); // skip green color
        this.readUnsignedByte(); // skip blue color
        const sprite = new Sprite_1.Sprite(id, this.m_transparency);
        const length = this.readUnsignedShort();
        if (length !== 0) {
            const compressedPixels = new ByteArray_1.ByteArray();
            this.readBytes(compressedPixels, 0, length);
            sprite.compressedPixels = compressedPixels;
        }
        return sprite;
    }
    isEmptySprite(id) {
        this.position = ((id - 1) * SpriteFileSize_1.SpriteFileSize.ADDRESS) + this.m_headerSize;
        const address = this.readUnsignedInt();
        if (address === 0) {
            return true;
        }
        this.position = address;
        this.readUnsignedByte(); // skip red color
        this.readUnsignedByte(); // skip green color
        this.readUnsignedByte(); // skip blue color
        return this.readUnsignedShort() === 0;
    }
    static fromFile(filePath, extended, transparency) {
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
        return new SpriteReader(extended, transparency, bytes);
    }
}
exports.SpriteReader = SpriteReader;

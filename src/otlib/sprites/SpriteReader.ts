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

import * as fs from "fs";
import { ByteArray } from "../utils/ByteArray";
import { Sprite } from "./Sprite";
import { ISpriteReader } from "./ISpriteReader";
import { SpriteFilePosition } from "./SpriteFilePosition";
import { SpriteFileSize } from "./SpriteFileSize";

export class SpriteReader implements ISpriteReader {
    private m_extended: boolean;
    private m_transparency: boolean;
    private m_headerSize: number;
    private _bytes: ByteArray;
    private _position: number = 0;

    public get bytesAvailable(): number {
        return this._bytes.length - this._position;
    }

    public get position(): number {
        return this._position;
    }

    public set position(value: number) {
        this._position = value;
    }

    constructor(extended: boolean, transparency: boolean, bytes?: ByteArray) {
        this.m_extended = extended;
        this.m_transparency = transparency;
        this.m_headerSize = extended ? SpriteFileSize.HEADER_U32 : SpriteFileSize.HEADER_U16;
        this._bytes = bytes || new ByteArray();
    }

    public readUnsignedByte(): number {
        const value = this._bytes.buffer.readUInt8(this._position);
        this._position++;
        return value;
    }

    public readUnsignedShort(): number {
        const value = this._bytes.buffer.readUInt16LE(this._position);
        this._position += 2;
        return value;
    }

    public readUnsignedInt(): number {
        const value = this._bytes.buffer.readUInt32LE(this._position);
        this._position += 4;
        return value;
    }

    public readBytes(bytes: ByteArray, offset: number, length: number): void {
        const data = this._bytes.buffer.slice(this._position, this._position + length);
        const existingBuffer = bytes.toBuffer();
        const targetBuffer = Buffer.alloc(Math.max(existingBuffer.length, offset + length));
        existingBuffer.copy(targetBuffer);
        data.copy(targetBuffer, offset);
        // Update the ByteArray's internal buffer
        bytes.buffer = targetBuffer;
        this._position += length;
    }

    public readSignature(): number {
        this.position = SpriteFilePosition.SIGNATURE;
        return this.readUnsignedInt();
    }

    public readSpriteCount(): number {
        this.position = SpriteFilePosition.LENGTH;
        return this.m_extended ? this.readUnsignedInt() : this.readUnsignedShort();
    }

    public readSprite(id: number): Sprite | null {
        this.position = ((id - 1) * SpriteFileSize.ADDRESS) + this.m_headerSize;

        const address = this.readUnsignedInt();
        if (address === 0) {
            return null;
        }

        this.position = address;
        this.readUnsignedByte(); // skip red color
        this.readUnsignedByte(); // skip green color
        this.readUnsignedByte(); // skip blue color

        const sprite = new Sprite(id, this.m_transparency);
        const length = this.readUnsignedShort();

        if (length !== 0) {
            const compressedPixels = new ByteArray();
            this.readBytes(compressedPixels, 0, length);
            sprite.compressedPixels = compressedPixels;
        }

        return sprite;
    }

    public isEmptySprite(id: number): boolean {
        this.position = ((id - 1) * SpriteFileSize.ADDRESS) + this.m_headerSize;

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

    public static fromFile(filePath: string, extended: boolean, transparency: boolean): SpriteReader {
        const fileBuffer = fs.readFileSync(filePath);
        const bytes = ByteArray.fromBuffer(fileBuffer);
        return new SpriteReader(extended, transparency, bytes);
    }
}


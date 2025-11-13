"use strict";
/*
*  ByteArray utility class
*  Replaces flash.utils.ByteArray
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteArray = void 0;
class ByteArray {
    get buffer() {
        return this._buffer;
    }
    set buffer(value) {
        this._buffer = value;
    }
    constructor(initialSize = 0) {
        this._position = 0;
        this._buffer = Buffer.alloc(initialSize);
    }
    get length() {
        return this._buffer.length;
    }
    get bytesAvailable() {
        return this._buffer.length - this._position;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    readBytes(bytes, offset = 0, length = 0) {
        if (length === 0) {
            length = this.bytesAvailable;
        }
        const data = this._buffer.slice(this._position, this._position + length);
        const existingBuffer = bytes.toBuffer();
        const targetBuffer = Buffer.alloc(Math.max(existingBuffer.length, offset + length));
        existingBuffer.copy(targetBuffer);
        data.copy(targetBuffer, offset);
        bytes.buffer = targetBuffer;
        this._position += length;
    }
    writeByte(value) {
        this.ensureCapacity(1);
        this._buffer.writeUInt8(value, this._position);
        this._position++;
    }
    writeShort(value) {
        this.ensureCapacity(2);
        this._buffer.writeUInt16LE(value, this._position);
        this._position += 2;
    }
    writeUnsignedShort(value) {
        this.ensureCapacity(2);
        this._buffer.writeUInt16LE(value, this._position);
        this._position += 2;
    }
    writeUnsignedInt(value) {
        this.ensureCapacity(4);
        this._buffer.writeUInt32LE(value, this._position);
        this._position += 4;
    }
    readUnsignedByte() {
        const value = this._buffer.readUInt8(this._position);
        this._position++;
        return value;
    }
    readUnsignedShort() {
        const value = this._buffer.readUInt16LE(this._position);
        this._position += 2;
        return value;
    }
    readUnsignedInt() {
        const value = this._buffer.readUInt32LE(this._position);
        this._position += 4;
        return value;
    }
    readInt() {
        const value = this._buffer.readInt32LE(this._position);
        this._position += 4;
        return value;
    }
    readByte() {
        const value = this._buffer.readInt8(this._position);
        this._position++;
        return value;
    }
    readShort() {
        const value = this._buffer.readInt16LE(this._position);
        this._position += 2;
        return value;
    }
    writeInt(value) {
        this.ensureCapacity(4);
        this._buffer.writeInt32LE(value, this._position);
        this._position += 4;
    }
    writeUTF(str) {
        const utf8Buffer = Buffer.from(str, "utf8");
        this.writeUnsignedShort(utf8Buffer.length);
        this.ensureCapacity(utf8Buffer.length);
        utf8Buffer.copy(this._buffer, this._position);
        this._position += utf8Buffer.length;
    }
    readUTF() {
        const length = this.readUnsignedShort();
        const str = this._buffer.toString("utf8", this._position, this._position + length);
        this._position += length;
        return str;
    }
    writeMultiByte(str, charset) {
        // For iso-8859-1, we need to handle single-byte encoding
        if (charset === "iso-8859-1") {
            const buffer = Buffer.alloc(str.length);
            for (let i = 0; i < str.length; i++) {
                const charCode = str.charCodeAt(i);
                buffer[i] = charCode > 255 ? 63 : charCode; // Replace non-ASCII with '?'
            }
            this.writeUnsignedShort(buffer.length);
            this.ensureCapacity(buffer.length);
            buffer.copy(this._buffer, this._position);
            this._position += buffer.length;
        }
        else {
            // Default to UTF-8
            this.writeUTF(str);
        }
    }
    readMultiByte(length, charset) {
        if (charset === "iso-8859-1") {
            const buffer = this._buffer.slice(this._position, this._position + length);
            let str = "";
            for (let i = 0; i < buffer.length; i++) {
                str += String.fromCharCode(buffer[i]);
            }
            this._position += length;
            return str;
        }
        else {
            // Default to UTF-8
            const str = this._buffer.toString("utf8", this._position, this._position + length);
            this._position += length;
            return str;
        }
    }
    clear() {
        this._buffer = Buffer.alloc(0);
        this._position = 0;
    }
    toBuffer() {
        return this._buffer;
    }
    static fromBuffer(buffer) {
        const ba = new ByteArray();
        ba._buffer = Buffer.from(buffer);
        return ba;
    }
    ensureCapacity(needed) {
        if (this._position + needed > this._buffer.length) {
            const newBuffer = Buffer.alloc(this._position + needed);
            this._buffer.copy(newBuffer);
            this._buffer = newBuffer;
        }
    }
}
exports.ByteArray = ByteArray;

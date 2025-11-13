/*
*  ByteArray utility class
*  Replaces flash.utils.ByteArray
*/

export class ByteArray {
    private _buffer: Buffer;
    private _position: number = 0;

    public get buffer(): Buffer {
        return this._buffer;
    }

    public set buffer(value: Buffer) {
        this._buffer = value;
    }

    constructor(initialSize: number = 0) {
        this._buffer = Buffer.alloc(initialSize);
    }

    public get length(): number {
        return this._buffer.length;
    }

    public get bytesAvailable(): number {
        return this._buffer.length - this._position;
    }

    public get position(): number {
        return this._position;
    }

    public set position(value: number) {
        this._position = value;
    }

    public readBytes(bytes: ByteArray, offset: number = 0, length: number = 0): void {
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

    public writeByte(value: number): void {
        this.ensureCapacity(1);
        this._buffer.writeUInt8(value, this._position);
        this._position++;
    }

    public writeShort(value: number): void {
        this.ensureCapacity(2);
        this._buffer.writeUInt16LE(value, this._position);
        this._position += 2;
    }

    public writeUnsignedShort(value: number): void {
        this.ensureCapacity(2);
        this._buffer.writeUInt16LE(value, this._position);
        this._position += 2;
    }

    public writeUnsignedInt(value: number): void {
        this.ensureCapacity(4);
        this._buffer.writeUInt32LE(value, this._position);
        this._position += 4;
    }

    public readUnsignedByte(): number {
        const value = this._buffer.readUInt8(this._position);
        this._position++;
        return value;
    }

    public readUnsignedShort(): number {
        const value = this._buffer.readUInt16LE(this._position);
        this._position += 2;
        return value;
    }

    public readUnsignedInt(): number {
        const value = this._buffer.readUInt32LE(this._position);
        this._position += 4;
        return value;
    }

    public readInt(): number {
        const value = this._buffer.readInt32LE(this._position);
        this._position += 4;
        return value;
    }

    public readByte(): number {
        const value = this._buffer.readInt8(this._position);
        this._position++;
        return value;
    }

    public readShort(): number {
        const value = this._buffer.readInt16LE(this._position);
        this._position += 2;
        return value;
    }

    public writeInt(value: number): void {
        this.ensureCapacity(4);
        this._buffer.writeInt32LE(value, this._position);
        this._position += 4;
    }

    public writeUTF(str: string): void {
        const utf8Buffer = Buffer.from(str, "utf8");
        this.writeUnsignedShort(utf8Buffer.length);
        this.ensureCapacity(utf8Buffer.length);
        utf8Buffer.copy(this._buffer, this._position);
        this._position += utf8Buffer.length;
    }

    public readUTF(): string {
        const length = this.readUnsignedShort();
        const str = this._buffer.toString("utf8", this._position, this._position + length);
        this._position += length;
        return str;
    }

    public writeMultiByte(str: string, charset: string): void {
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
        } else {
            // Default to UTF-8
            this.writeUTF(str);
        }
    }

    public readMultiByte(length: number, charset: string): string {
        if (charset === "iso-8859-1") {
            const buffer = this._buffer.slice(this._position, this._position + length);
            let str = "";
            for (let i = 0; i < buffer.length; i++) {
                str += String.fromCharCode(buffer[i]);
            }
            this._position += length;
            return str;
        } else {
            // Default to UTF-8
            const str = this._buffer.toString("utf8", this._position, this._position + length);
            this._position += length;
            return str;
        }
    }

    public clear(): void {
        this._buffer = Buffer.alloc(0);
        this._position = 0;
    }

    public toBuffer(): Buffer {
        return this._buffer;
    }

    public static fromBuffer(buffer: Buffer): ByteArray {
        const ba = new ByteArray();
        ba._buffer = Buffer.from(buffer);
        return ba;
    }

    private ensureCapacity(needed: number): void {
        if (this._position + needed > this._buffer.length) {
            const newBuffer = Buffer.alloc(this._position + needed);
            this._buffer.copy(newBuffer);
            this._buffer = newBuffer;
        }
    }
}

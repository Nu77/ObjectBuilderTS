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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataWriter = void 0;
const ByteArray_1 = require("../utils/ByteArray");
const ThingCategory_1 = require("./ThingCategory");
class MetadataWriter {
    constructor() {
        this._bytes = new ByteArray_1.ByteArray();
    }
    writeByte(value) { this._bytes.writeByte(value); }
    writeShort(value) { this._bytes.writeShort(value); }
    writeUnsignedShort(value) { this._bytes.writeShort(value); }
    writeUnsignedInt(value) { this._bytes.writeUnsignedInt(value); }
    writeInt(value) { this._bytes.writeUnsignedInt(value); } // TODO: Implement signed int
    writeTexturePatterns(type, extended, frameDurations, frameGroups) {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = type.frameGroups.length;
            this.writeByte(groupCount);
        }
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
                let group = groupType;
                if (groupCount < 2) {
                    group = 1;
                }
                this.writeByte(group);
            }
            const frameGroup = type.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            this.writeByte(frameGroup.width); // Write width
            this.writeByte(frameGroup.height); // Write height
            if (frameGroup.width > 1 || frameGroup.height > 1) {
                this.writeByte(frameGroup.exactSize); // Write exact size
            }
            this.writeByte(frameGroup.layers); // Write layers
            this.writeByte(frameGroup.patternX); // Write pattern X
            this.writeByte(frameGroup.patternY); // Write pattern Y
            this.writeByte(frameGroup.patternZ); // Write pattern Z
            this.writeByte(frameGroup.frames); // Write frames
            if (frameDurations && frameGroup.isAnimation && frameGroup.frameDurations) {
                this.writeByte(frameGroup.animationMode); // Write animation type
                this.writeInt(frameGroup.loopCount); // Write loop count
                this.writeByte(frameGroup.startFrame); // Write start frame
                for (let i = 0; i < frameGroup.frames; i++) {
                    const duration = frameGroup.frameDurations[i];
                    this.writeUnsignedInt(duration.minimum); // Write minimum duration
                    this.writeUnsignedInt(duration.maximum); // Write maximum duration
                }
            }
            const spriteIndex = frameGroup.spriteIndex;
            if (spriteIndex) {
                const length = spriteIndex.length;
                for (let i = 0; i < length; i++) {
                    // Write sprite index
                    if (extended) {
                        this.writeUnsignedInt(spriteIndex[i]);
                    }
                    else {
                        this.writeShort(spriteIndex[i]);
                    }
                }
            }
        }
        return true;
    }
    toBuffer() {
        return this._bytes.toBuffer();
    }
}
exports.MetadataWriter = MetadataWriter;

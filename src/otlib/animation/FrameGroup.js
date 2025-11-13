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
exports.FrameGroup = void 0;
const Size_1 = require("../geom/Size");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const FrameDuration_1 = require("./FrameDuration");
const AnimationMode_1 = require("./AnimationMode");
class FrameGroup {
    constructor() {
        this.type = 0;
        this.width = 1;
        this.height = 1;
        this.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        this.layers = 1;
        this.patternX = 1;
        this.patternY = 1;
        this.patternZ = 1;
        this.frames = 1;
        this.spriteIndex = null;
        this.isAnimation = false;
        this.animationMode = AnimationMode_1.AnimationMode.ASYNCHRONOUS;
        this.loopCount = 0;
        this.startFrame = 0;
        this.frameDurations = null;
        this.type = 0;
        this.width = 1;
        this.height = 1;
        this.layers = 1;
        this.frames = 1;
        this.patternX = 1;
        this.patternY = 1;
        this.patternZ = 1;
        this.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        this.isAnimation = false;
        this.animationMode = AnimationMode_1.AnimationMode.ASYNCHRONOUS;
        this.loopCount = 0;
        this.startFrame = 0;
        this.frameDurations = null;
    }
    getFrameDuration(index) {
        if (this.frameDurations) {
            return this.frameDurations[index];
        }
        return null;
    }
    getTotalX() {
        return this.patternZ * this.patternX * this.layers;
    }
    getTotalY() {
        return this.frames * this.patternY;
    }
    getTotalSprites() {
        return this.width *
            this.height *
            this.patternX *
            this.patternY *
            this.patternZ *
            this.frames *
            this.layers;
    }
    getTotalTextures() {
        return this.patternX *
            this.patternY *
            this.patternZ *
            this.frames *
            this.layers;
    }
    getSpriteIndex(width, height, layer, patternX, patternY, patternZ, frame) {
        return ((((((frame % this.frames) *
            this.patternZ + patternZ) *
            this.patternY + patternY) *
            this.patternX + patternX) *
            this.layers + layer) *
            this.height + height) *
            this.width + width;
    }
    getTextureIndex(layer, patternX, patternY, patternZ, frame) {
        return (((frame % this.frames *
            this.patternZ + patternZ) *
            this.patternY + patternY) *
            this.patternX + patternX) *
            this.layers + layer;
    }
    getSpriteSheetSize() {
        const size = new Size_1.Size();
        size.width = this.patternZ * this.patternX * this.layers * this.width * SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        size.height = this.frames * this.patternY * this.height * SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        return size;
    }
    makeOutfitGroup(duration) {
        this.patternX = 4; // Directions
        this.frames = 1; // Animations
        this.isAnimation = false;
        this.frameDurations = new Array(this.frames);
        for (let i = 0; i < this.frames; i++) {
            this.frameDurations[i] = new FrameDuration_1.FrameDuration(duration, duration);
        }
        this.spriteIndex = new Array(this.getTotalSprites());
    }
    clone() {
        const group = new FrameGroup();
        group.type = this.type;
        group.width = this.width;
        group.height = this.height;
        group.layers = this.layers;
        group.frames = this.frames;
        group.patternX = this.patternX;
        group.patternY = this.patternY;
        group.patternZ = this.patternZ;
        group.exactSize = this.exactSize;
        if (this.spriteIndex) {
            group.spriteIndex = [...this.spriteIndex];
        }
        group.animationMode = this.animationMode;
        group.loopCount = this.loopCount;
        group.startFrame = this.startFrame;
        if (this.frames > 1) {
            group.isAnimation = true;
            group.frameDurations = new Array(this.frames);
            if (this.frameDurations) {
                for (let i = 0; i < this.frames; i++) {
                    group.frameDurations[i] = this.frameDurations[i].clone();
                }
            }
        }
        return group;
    }
}
exports.FrameGroup = FrameGroup;

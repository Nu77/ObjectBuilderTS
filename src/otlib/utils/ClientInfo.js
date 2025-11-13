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
exports.ClientInfo = void 0;
class ClientInfo {
    constructor() {
        this.clientVersion = 0;
        this.clientVersionStr = "";
        this.datSignature = 0;
        this.minItemId = 0;
        this.maxItemId = 0;
        this.minOutfitId = 0;
        this.maxOutfitId = 0;
        this.minEffectId = 0;
        this.maxEffectId = 0;
        this.minMissileId = 0;
        this.maxMissileId = 0;
        this.sprSignature = 0;
        this.minSpriteId = 0;
        this.maxSpriteId = 0;
        this.extended = false;
        this.transparency = false;
        this.improvedAnimations = false;
        this.frameGroups = false;
        this.changed = false;
        this.isTemporary = false;
        this.loaded = false;
        this.spriteSize = 0;
        this.spriteDataSize = 0;
    }
}
exports.ClientInfo = ClientInfo;

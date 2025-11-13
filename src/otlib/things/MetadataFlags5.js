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
exports.MetadataFlags5 = void 0;
/**
 * The MetadataFlags5 class defines the valid constant values for the client versions 8.60 - 9.86
 */
class MetadataFlags5 {
    constructor() {
        throw new Error("MetadataFlags5 is a static class and cannot be instantiated");
    }
}
exports.MetadataFlags5 = MetadataFlags5;
MetadataFlags5.GROUND = 0x00;
MetadataFlags5.GROUND_BORDER = 0x01;
MetadataFlags5.ON_BOTTOM = 0x02;
MetadataFlags5.ON_TOP = 0x03;
MetadataFlags5.CONTAINER = 0x04;
MetadataFlags5.STACKABLE = 0x05;
MetadataFlags5.FORCE_USE = 0x06;
MetadataFlags5.MULTI_USE = 0x07;
MetadataFlags5.WRITABLE = 0x08;
MetadataFlags5.WRITABLE_ONCE = 0x09;
MetadataFlags5.FLUID_CONTAINER = 0x0A;
MetadataFlags5.FLUID = 0x0B;
MetadataFlags5.UNPASSABLE = 0x0C;
MetadataFlags5.UNMOVEABLE = 0x0D;
MetadataFlags5.BLOCK_MISSILE = 0x0E;
MetadataFlags5.BLOCK_PATHFIND = 0x0F;
MetadataFlags5.PICKUPABLE = 0x10;
MetadataFlags5.HANGABLE = 0x11;
MetadataFlags5.VERTICAL = 0x12;
MetadataFlags5.HORIZONTAL = 0x13;
MetadataFlags5.ROTATABLE = 0x14;
MetadataFlags5.HAS_LIGHT = 0x15;
MetadataFlags5.DONT_HIDE = 0x16;
MetadataFlags5.TRANSLUCENT = 0x17;
MetadataFlags5.HAS_OFFSET = 0x18;
MetadataFlags5.HAS_ELEVATION = 0x19;
MetadataFlags5.LYING_OBJECT = 0x1A;
MetadataFlags5.ANIMATE_ALWAYS = 0x1B;
MetadataFlags5.MINI_MAP = 0x1C;
MetadataFlags5.LENS_HELP = 0x1D;
MetadataFlags5.FULL_GROUND = 0x1E;
MetadataFlags5.IGNORE_LOOK = 0x1F;
MetadataFlags5.CLOTH = 0x20;
MetadataFlags5.MARKET_ITEM = 0x21;
MetadataFlags5.LAST_FLAG = 0xFF;
MetadataFlags5.STRING_CHARSET = "iso-8859-1";

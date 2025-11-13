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
exports.MetadataFlags6 = void 0;
/**
 * The MetadataFlags6 class defines the valid constant values for the client versions 10.10 - 10.56
 */
class MetadataFlags6 {
    constructor() {
        throw new Error("MetadataFlags6 is a static class and cannot be instantiated");
    }
}
exports.MetadataFlags6 = MetadataFlags6;
MetadataFlags6.GROUND = 0x00;
MetadataFlags6.GROUND_BORDER = 0x01;
MetadataFlags6.ON_BOTTOM = 0x02;
MetadataFlags6.ON_TOP = 0x03;
MetadataFlags6.CONTAINER = 0x04;
MetadataFlags6.STACKABLE = 0x05;
MetadataFlags6.FORCE_USE = 0x06;
MetadataFlags6.MULTI_USE = 0x07;
MetadataFlags6.WRITABLE = 0x08;
MetadataFlags6.WRITABLE_ONCE = 0x09;
MetadataFlags6.FLUID_CONTAINER = 0x0A;
MetadataFlags6.FLUID = 0x0B;
MetadataFlags6.UNPASSABLE = 0x0C;
MetadataFlags6.UNMOVEABLE = 0x0D;
MetadataFlags6.BLOCK_MISSILE = 0x0E;
MetadataFlags6.BLOCK_PATHFIND = 0x0F;
MetadataFlags6.NO_MOVE_ANIMATION = 0x10;
MetadataFlags6.PICKUPABLE = 0x11;
MetadataFlags6.HANGABLE = 0x12;
MetadataFlags6.VERTICAL = 0x13;
MetadataFlags6.HORIZONTAL = 0x14;
MetadataFlags6.ROTATABLE = 0x15;
MetadataFlags6.HAS_LIGHT = 0x16;
MetadataFlags6.DONT_HIDE = 0x17;
MetadataFlags6.TRANSLUCENT = 0x18;
MetadataFlags6.HAS_OFFSET = 0x19;
MetadataFlags6.HAS_ELEVATION = 0x1A;
MetadataFlags6.LYING_OBJECT = 0x1B;
MetadataFlags6.ANIMATE_ALWAYS = 0x1C;
MetadataFlags6.MINI_MAP = 0x1D;
MetadataFlags6.LENS_HELP = 0x1E;
MetadataFlags6.FULL_GROUND = 0x1F;
MetadataFlags6.IGNORE_LOOK = 0x20;
MetadataFlags6.CLOTH = 0x21;
MetadataFlags6.MARKET_ITEM = 0x22;
MetadataFlags6.DEFAULT_ACTION = 0x23;
MetadataFlags6.WRAPPABLE = 0x24;
MetadataFlags6.UNWRAPPABLE = 0x25;
MetadataFlags6.TOP_EFFECT = 0x26;
MetadataFlags6.USABLE = 0xFE;
MetadataFlags6.LAST_FLAG = 0xFF;
MetadataFlags6.STRING_CHARSET = "iso-8859-1";

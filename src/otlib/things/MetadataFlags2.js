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
exports.MetadataFlags2 = void 0;
/**
 * The MetadataFlags2 class defines the valid constant values for the client versions 7.40 - 7.50
 */
class MetadataFlags2 {
    constructor() {
        throw new Error("MetadataFlags2 is a static class and cannot be instantiated");
    }
}
exports.MetadataFlags2 = MetadataFlags2;
MetadataFlags2.GROUND = 0x00;
MetadataFlags2.ON_BOTTOM = 0x01;
MetadataFlags2.ON_TOP = 0x02;
MetadataFlags2.CONTAINER = 0x03;
MetadataFlags2.STACKABLE = 0x04;
MetadataFlags2.MULTI_USE = 0x05;
MetadataFlags2.FORCE_USE = 0x06;
MetadataFlags2.WRITABLE = 0x07;
MetadataFlags2.WRITABLE_ONCE = 0x08;
MetadataFlags2.FLUID_CONTAINER = 0x09;
MetadataFlags2.FLUID = 0x0A;
MetadataFlags2.UNPASSABLE = 0x0B;
MetadataFlags2.UNMOVEABLE = 0x0C;
MetadataFlags2.BLOCK_MISSILE = 0x0D;
MetadataFlags2.BLOCK_PATHFINDER = 0x0E;
MetadataFlags2.PICKUPABLE = 0x0F;
MetadataFlags2.HAS_LIGHT = 0x10;
MetadataFlags2.FLOOR_CHANGE = 0x11;
MetadataFlags2.FULL_GROUND = 0x12;
MetadataFlags2.HAS_ELEVATION = 0x13;
MetadataFlags2.HAS_OFFSET = 0x14;
// Flag 0x15 ????
MetadataFlags2.MINI_MAP = 0x16;
MetadataFlags2.ROTATABLE = 0x17;
MetadataFlags2.LYING_OBJECT = 0x18;
MetadataFlags2.HANGABLE = 0x19;
MetadataFlags2.VERTICAL = 0x1A;
MetadataFlags2.HORIZONTAL = 0x1B;
MetadataFlags2.ANIMATE_ALWAYS = 0x1C;
MetadataFlags2.LENS_HELP = 0x1D;
MetadataFlags2.WRAPPABLE = 0x24;
MetadataFlags2.UNWRAPPABLE = 0x25;
MetadataFlags2.TOP_EFFECT = 0x26;
MetadataFlags2.LAST_FLAG = 0xFF;

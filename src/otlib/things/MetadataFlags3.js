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
exports.MetadataFlags3 = void 0;
/**
 * The MetadataFlags3 class defines the valid constant values for the client versions 7.55 - 7.72
 */
class MetadataFlags3 {
    constructor() {
        throw new Error("MetadataFlags3 is a static class and cannot be instantiated");
    }
}
exports.MetadataFlags3 = MetadataFlags3;
MetadataFlags3.GROUND = 0x00;
MetadataFlags3.GROUND_BORDER = 0x01;
MetadataFlags3.ON_BOTTOM = 0x02;
MetadataFlags3.ON_TOP = 0x03;
MetadataFlags3.CONTAINER = 0x04;
MetadataFlags3.STACKABLE = 0x05;
MetadataFlags3.FORCE_USE = 0x06;
MetadataFlags3.MULTI_USE = 0x07;
MetadataFlags3.WRITABLE = 0x08;
MetadataFlags3.WRITABLE_ONCE = 0x09;
MetadataFlags3.FLUID_CONTAINER = 0x0A;
MetadataFlags3.FLUID = 0x0B;
MetadataFlags3.UNPASSABLE = 0x0C;
MetadataFlags3.UNMOVEABLE = 0x0D;
MetadataFlags3.BLOCK_MISSILE = 0x0E;
MetadataFlags3.BLOCK_PATHFINDER = 0x0F;
MetadataFlags3.PICKUPABLE = 0x10;
MetadataFlags3.HANGABLE = 0x11;
MetadataFlags3.VERTICAL = 0x12;
MetadataFlags3.HORIZONTAL = 0x13;
MetadataFlags3.ROTATABLE = 0x14;
MetadataFlags3.HAS_LIGHT = 0x15;
// Flag 0x16 ????
MetadataFlags3.FLOOR_CHANGE = 0x17;
MetadataFlags3.HAS_OFFSET = 0x18;
MetadataFlags3.HAS_ELEVATION = 0x19;
MetadataFlags3.LYING_OBJECT = 0x1A;
MetadataFlags3.ANIMATE_ALWAYS = 0x1B;
MetadataFlags3.MINI_MAP = 0x1C;
MetadataFlags3.LENS_HELP = 0x1D;
MetadataFlags3.FULL_GROUND = 0x1E;
MetadataFlags3.LAST_FLAG = 0xFF;

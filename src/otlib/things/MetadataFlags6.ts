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

/**
 * The MetadataFlags6 class defines the valid constant values for the client versions 10.10 - 10.56
 */
export class MetadataFlags6 {
    private constructor() {
        throw new Error("MetadataFlags6 is a static class and cannot be instantiated");
    }

    public static readonly GROUND: number = 0x00;
    public static readonly GROUND_BORDER: number = 0x01;
    public static readonly ON_BOTTOM: number = 0x02;
    public static readonly ON_TOP: number = 0x03;
    public static readonly CONTAINER: number = 0x04;
    public static readonly STACKABLE: number = 0x05;
    public static readonly FORCE_USE: number = 0x06;
    public static readonly MULTI_USE: number = 0x07;
    public static readonly WRITABLE: number = 0x08;
    public static readonly WRITABLE_ONCE: number = 0x09;
    public static readonly FLUID_CONTAINER: number = 0x0A;
    public static readonly FLUID: number = 0x0B;
    public static readonly UNPASSABLE: number = 0x0C;
    public static readonly UNMOVEABLE: number = 0x0D;
    public static readonly BLOCK_MISSILE: number = 0x0E;
    public static readonly BLOCK_PATHFIND: number = 0x0F;
    public static readonly NO_MOVE_ANIMATION: number = 0x10;
    public static readonly PICKUPABLE: number = 0x11;
    public static readonly HANGABLE: number = 0x12;
    public static readonly VERTICAL: number = 0x13;
    public static readonly HORIZONTAL: number = 0x14;
    public static readonly ROTATABLE: number = 0x15;
    public static readonly HAS_LIGHT: number = 0x16;
    public static readonly DONT_HIDE: number = 0x17;
    public static readonly TRANSLUCENT: number = 0x18;
    public static readonly HAS_OFFSET: number = 0x19;
    public static readonly HAS_ELEVATION: number = 0x1A;
    public static readonly LYING_OBJECT: number = 0x1B;
    public static readonly ANIMATE_ALWAYS: number = 0x1C;
    public static readonly MINI_MAP: number = 0x1D;
    public static readonly LENS_HELP: number = 0x1E;
    public static readonly FULL_GROUND: number = 0x1F;
    public static readonly IGNORE_LOOK: number = 0x20;
    public static readonly CLOTH: number = 0x21;
    public static readonly MARKET_ITEM: number = 0x22;
    public static readonly DEFAULT_ACTION: number = 0x23;
    public static readonly WRAPPABLE: number = 0x24;
    public static readonly UNWRAPPABLE: number = 0x25;
    public static readonly TOP_EFFECT: number = 0x26;
    public static readonly USABLE: number = 0xFE;
    public static readonly LAST_FLAG: number = 0xFF;
    public static readonly STRING_CHARSET: string = "iso-8859-1";
}


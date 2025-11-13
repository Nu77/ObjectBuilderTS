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

export class Direction {
    private _value: number;
    private _type: string;

    public get value(): number { return this._value; }
    public get type(): string { return this._type; }

    private static created: boolean = false;

    public static readonly NORTH: Direction = new Direction(0, "north");
    public static readonly EAST: Direction = new Direction(1, "east");
    public static readonly SOUTH: Direction = new Direction(2, "south");
    public static readonly WEST: Direction = new Direction(3, "west");
    public static readonly SOUTHWEST: Direction = new Direction(4, "southwest");
    public static readonly SOUTHEAST: Direction = new Direction(5, "southeast");
    public static readonly NORTHWEST: Direction = new Direction(6, "northwest");
    public static readonly NORTHEAST: Direction = new Direction(7, "northeast");

    constructor(value: number, type: string) {
        if (Direction.created) {
            throw new Error("Direction is a static class and cannot be instantiated");
        }

        this._value = value;
        this._type = type;
    }

    public toString(): string {
        return this._type;
    }

    public static toDirection(value: number): Direction | null {
        switch (value) {
            case 0:
                return Direction.NORTH;
            case 1:
                return Direction.EAST;
            case 2:
                return Direction.SOUTH;
            case 3:
                return Direction.WEST;
            case 4:
                return Direction.SOUTHWEST;
            case 5:
                return Direction.SOUTHEAST;
            case 6:
                return Direction.NORTHWEST;
            case 7:
                return Direction.NORTHEAST;
        }
        return null;
    }

    public static isDiagonal(value: Direction | null): boolean {
        if (!value) {
            return false;
        }
        return value === Direction.SOUTHWEST || 
               value === Direction.SOUTHEAST || 
               value === Direction.NORTHWEST || 
               value === Direction.NORTHEAST;
    }
}

// Lock the class after static initialization
(Direction as any).created = true;


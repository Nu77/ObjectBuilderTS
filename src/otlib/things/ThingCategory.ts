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

export class ThingCategory {
    public static readonly ITEM: string = "item";
    public static readonly OUTFIT: string = "outfit";
    public static readonly EFFECT: string = "effect";
    public static readonly MISSILE: string = "missile";

    private constructor() {
        throw new Error("ThingCategory is a static class and cannot be instantiated");
    }

    public static isValid(category: string): boolean {
        return (category === ThingCategory.ITEM || 
                category === ThingCategory.OUTFIT || 
                category === ThingCategory.EFFECT || 
                category === ThingCategory.MISSILE);
    }

    public static getCategory(value: string | null | undefined): string | null {
        if (value) {
            const normalized = value.toLowerCase().trim();
            switch (normalized) {
                case "item":
                    return ThingCategory.ITEM;
                case "outfit":
                    return ThingCategory.OUTFIT;
                case "effect":
                    return ThingCategory.EFFECT;
                case "missile":
                    return ThingCategory.MISSILE;
            }
        }
        return null;
    }

    public static getCategoryByValue(value: number): string | null {
        switch (value) {
            case 1:
                return ThingCategory.ITEM;
            case 2:
                return ThingCategory.OUTFIT;
            case 3:
                return ThingCategory.EFFECT;
            case 4:
                return ThingCategory.MISSILE;
        }
        return null;
    }

    public static getValue(category: string): number {
        if (category) {
            switch (category) {
                case "item":
                    return 1;
                case "outfit":
                    return 2;
                case "effect":
                    return 3;
                case "missile":
                    return 4;
            }
        }
        return 0;
    }
}


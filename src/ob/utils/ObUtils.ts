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

import * as path from "path";
import { ThingCategory } from "../../otlib/things/ThingCategory";
import { ThingType } from "../../otlib/things/ThingType";
import { FrameGroupType } from "../../otlib/things/FrameGroupType";
import { Resources } from "../../otlib/resources/Resources";

export class ObUtils {
    private constructor() {
        throw new Error("ObUtils is a static class and cannot be instantiated");
    }

    public static toLocale(category: string): string {
        let result = "";

        if (ThingCategory.getCategory(category)) {
            switch (category) {
                case ThingCategory.ITEM:
                    result = Resources.getString("item");
                    break;
                case ThingCategory.OUTFIT:
                    result = Resources.getString("outfit");
                    break;
                case ThingCategory.EFFECT:
                    result = Resources.getString("effect");
                    break;
                case ThingCategory.MISSILE:
                    result = Resources.getString("missile");
                    break;
            }
        }
        return result;
    }

    public static hundredFloor(value: number): number {
        return Math.floor(value / 100) * 100;
    }

    public static getPatternsString(thing: ThingType, saveValue: number): string {
        let text = "";

        if (saveValue === 2) {
            const list: string[] = [];
            // Note: TypeScript doesn't have describeType like ActionScript
            // This would need to be implemented using reflection or metadata
            // For now, we'll use a simplified approach
            const properties = Object.keys(thing);
            for (const name of properties) {
                const value = (thing as any)[name];
                if (name !== "id" && (typeof value === "boolean" || typeof value === "number")) {
                    list.push(`${name} = ${value}\n`);
                }
            }

            list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
            text = list.join("");
            return text;
        }

        const frameGroup = thing.getFrameGroup(FrameGroupType.DEFAULT);
        if (!frameGroup) {
            return "";
        }

        text = `width = ${frameGroup.width}\n` +
               `height = ${frameGroup.height}\n` +
               `cropSize = ${frameGroup.exactSize}\n` +
               `layers = ${frameGroup.layers}\n` +
               `patternX = ${frameGroup.patternX}\n` +
               `patternY = ${frameGroup.patternY}\n` +
               `patternZ = ${frameGroup.patternZ}\n` +
               `animations = ${frameGroup.frames}\n`;

        return text;
    }

    public static sortFiles(list: string[] | null, flags: number): string[] | null {
        if (!list || flags === 0) return list;

        interface FileEntry {
            id: number;
            file: string;
        }

        const array: FileEntry[] = [];
        const length = list.length;
        for (let i = 0; i < length; i++) {
            let id = 0;
            const file = list[i];
            const name = path.basename(file, path.extname(file));

            const parts = name.split("_");
            if (parts.length > 1) {
                id = parseInt(parts[1], 10);
            } else {
                const extensionIndex = name.indexOf(".");
                if (extensionIndex !== -1) {
                    id = parseInt(name.substring(0, extensionIndex), 10);
                } else {
                    id = parseInt(name, 10);
                }
            }

            array[i] = { id, file };
        }

        array.sort((a, b) => {
            if (flags & 0x01) { // NUMERIC
                return a.id - b.id;
            }
            return a.id.toString().localeCompare(b.id.toString());
        });

        if (flags & 0x02) { // DESCENDING
            array.reverse();
        }

        for (let i = 0; i < length; i++) {
            list[i] = array[i].file;
        }
        return list;
    }

    public static createImagesFileFilter(): Array<{ description: string; extensions: string[] }> {
        return [
            { description: Resources.getString("allFormats"), extensions: ["*.png", "*.bmp", "*.jpg", "*.gif"] },
            { description: "PNG (*.PNG)", extensions: ["*.png"] },
            { description: "BMP (*.BMP)", extensions: ["*.bmp"] },
            { description: "JPEG (*.JPG)", extensions: ["*.jpg"] },
            { description: "CompuServe (*.GIF)", extensions: ["*.gif"] }
        ];
    }
}


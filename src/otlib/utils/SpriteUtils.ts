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

import { BitmapData } from "./BitmapData";
import { SpriteExtent } from "./SpriteExtent";
import { Rect } from "../geom/Rect";

export class SpriteUtils {
    private static readonly POINT = { x: 0, y: 0 };

    private constructor() {
        throw new Error("SpriteUtils is a static class and cannot be instantiated");
    }

    public static fillBackground(sprite: BitmapData): BitmapData {
        const bitmap = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, false, 0xFF00FF);
        bitmap.copyPixels(sprite, new Rect(0, 0, SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE), SpriteUtils.POINT, null, null, true);
        return bitmap;
    }

    public static removeMagenta(sprite: BitmapData): BitmapData {
        // Transform bitmap 24 to 32 bits if needed
        if (!sprite.transparent) {
            // Convert to 32-bit with transparency
            const converted = new BitmapData(sprite.width, sprite.height, true);
            converted.copyPixels(sprite, sprite.rect, SpriteUtils.POINT);
            sprite = converted;
        }

        // Replace magenta (0xFFFF00FF) with transparent (0x00FF00FF)
        // This would need pixel-level manipulation
        // For now, return the sprite as-is
        return sprite;
    }

    public static isEmpty(sprite: BitmapData): boolean {
        // Check if sprite has any non-transparent pixels
        // This is a simplified check - full implementation would scan pixels
        const pixels = sprite.getPixels(sprite.rect);
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] !== 0) { // Check alpha channel
                return false;
            }
        }
        return true;
    }

    public static createAlertBitmap(): BitmapData {
        // Create a simple alert bitmap
        // In the original, this loaded from Assets
        const size = SpriteExtent.DEFAULT_SIZE;
        const bitmap = new BitmapData(size, size, true, 0xFFFF0000); // Red background
        
        // Draw a simple alert pattern
        // This would need to be replaced with actual asset loading
        return bitmap;
    }
}


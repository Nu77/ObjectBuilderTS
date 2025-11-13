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
exports.SpriteUtils = void 0;
const BitmapData_1 = require("./BitmapData");
const SpriteExtent_1 = require("./SpriteExtent");
const Rect_1 = require("../geom/Rect");
class SpriteUtils {
    constructor() {
        throw new Error("SpriteUtils is a static class and cannot be instantiated");
    }
    static fillBackground(sprite) {
        const bitmap = new BitmapData_1.BitmapData(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, false, 0xFF00FF);
        bitmap.copyPixels(sprite, new Rect_1.Rect(0, 0, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE), SpriteUtils.POINT, null, null, true);
        return bitmap;
    }
    static removeMagenta(sprite) {
        // Transform bitmap 24 to 32 bits if needed
        if (!sprite.transparent) {
            // Convert to 32-bit with transparency
            const converted = new BitmapData_1.BitmapData(sprite.width, sprite.height, true);
            converted.copyPixels(sprite, sprite.rect, SpriteUtils.POINT);
            sprite = converted;
        }
        // Replace magenta (0xFFFF00FF) with transparent (0x00FF00FF)
        // This would need pixel-level manipulation
        // For now, return the sprite as-is
        return sprite;
    }
    static isEmpty(sprite) {
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
    static createAlertBitmap() {
        // Create a simple alert bitmap
        // In the original, this loaded from Assets
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        const bitmap = new BitmapData_1.BitmapData(size, size, true, 0xFFFF0000); // Red background
        // Draw a simple alert pattern
        // This would need to be replaced with actual asset loading
        return bitmap;
    }
}
exports.SpriteUtils = SpriteUtils;
SpriteUtils.POINT = { x: 0, y: 0 };

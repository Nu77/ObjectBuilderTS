"use strict";

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

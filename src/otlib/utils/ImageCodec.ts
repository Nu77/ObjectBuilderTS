/*
*  ImageCodec utility for encoding BitmapData to image formats
*  Replaces Flash's ImageCodec
*/

import sharp from "sharp";
import { BitmapData } from "./BitmapData";

export class ImageCodec {
    /**
     * Encodes a BitmapData to the specified image format
     * @param bitmap The bitmap data to encode
     * @param format Image format (png, jpg, jpeg, bmp, gif)
     * @param jpegQuality JPEG quality (1-100), only used for JPEG format
     * @returns Buffer containing encoded image data
     */
    public static async encode(bitmap: BitmapData, format: string, jpegQuality: number = 80): Promise<Buffer> {
        if (!bitmap) {
            throw new Error("bitmap cannot be null");
        }

        // Get raw pixel data from bitmap
        const rect = bitmap.rect;
        const pixels = bitmap.getPixels(rect);

        // Convert format to lowercase
        const lowerFormat = format.toLowerCase();

        // Create sharp image from raw RGBA buffer
        let image = sharp(pixels, {
            raw: {
                width: rect.width,
                height: rect.height,
                channels: 4
            }
        });

        // Apply format-specific options
        if (lowerFormat === "jpg" || lowerFormat === "jpeg") {
            image = image.jpeg({ quality: Math.max(1, Math.min(100, jpegQuality)) });
        } else if (lowerFormat === "png") {
            image = image.png();
        } else if (lowerFormat === "bmp") {
            // Sharp doesn't support BMP directly, convert to PNG as fallback
            image = image.png();
        } else if (lowerFormat === "gif") {
            image = image.gif();
        } else {
            // Default to PNG
            image = image.png();
        }

        return await image.toBuffer();
    }

    /**
     * Checks if a format is a valid image format
     */
    public static hasImageFormat(format: string): boolean {
        const lowerFormat = format.toLowerCase();
        return ["png", "jpg", "jpeg", "bmp", "gif"].includes(lowerFormat);
    }
}


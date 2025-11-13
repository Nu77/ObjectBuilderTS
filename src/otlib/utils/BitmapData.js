"use strict";
/*
*  BitmapData abstraction for TypeScript
*  Replaces Flash's flash.display.BitmapData
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapData = void 0;
const canvas_1 = require("canvas");
class BitmapData {
    constructor(width, height, transparent = true, fillColor = 0x00000000) {
        this._canvas = null;
        this._context = null;
        this._imageData = null;
        this._buffer = null;
        this._width = width;
        this._height = height;
        this._transparent = transparent;
        this._canvas = (0, canvas_1.createCanvas)(width, height);
        this._context = this._canvas.getContext("2d");
        if (fillColor !== 0x00000000) {
            this.fillRect(0, 0, width, height, fillColor);
        }
    }
    get width() { return this._width; }
    get height() { return this._height; }
    get transparent() { return this._transparent; }
    get rect() {
        return { x: 0, y: 0, width: this._width, height: this._height };
    }
    fillRect(x, y, width, height, color) {
        if (!this._context)
            return;
        const rgba = this.argbToRgba(color);
        this._context.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255})`;
        this._context.fillRect(x, y, width, height);
    }
    setPixels(rect, pixels) {
        if (!this._context)
            return;
        const imageData = this._context.createImageData(rect.width, rect.height);
        const data = pixels instanceof Buffer ? new Uint8Array(pixels) : pixels;
        for (let i = 0; i < data.length && i < imageData.data.length; i++) {
            imageData.data[i] = data[i];
        }
        this._context.putImageData(imageData, rect.x, rect.y);
    }
    getPixels(rect) {
        if (!this._context) {
            return Buffer.alloc(rect.width * rect.height * 4);
        }
        const imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
        return Buffer.from(imageData.data);
    }
    copyPixels(source, sourceRect, destPoint, alphaBitmap = null, alphaPoint = null, mergeAlpha = false) {
        if (!this._context || !source._canvas)
            return;
        if (mergeAlpha && alphaBitmap && alphaBitmap._canvas) {
            // Handle alpha blending
            this._context.globalCompositeOperation = "source-over";
        }
        this._context.drawImage(source._canvas, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);
    }
    clone() {
        const cloned = new BitmapData(this._width, this._height, this._transparent);
        if (this._canvas && cloned._context) {
            cloned._context.drawImage(this._canvas, 0, 0);
        }
        return cloned;
    }
    copyChannel(source, sourceRect, destPoint, sourceChannel, destChannel) {
        if (!this._context || !source._context)
            return;
        // TODO: Implement channel copying
        // This is a placeholder - actual implementation would need to extract specific channels
        const imageData = source._context.getImageData(sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height);
        const destImageData = this._context.getImageData(destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);
        // Copy channel data (simplified - would need proper channel extraction)
        for (let i = 0; i < imageData.data.length; i += 4) {
            const channelIndex = sourceChannel; // 0=R, 1=G, 2=B, 3=A
            if (channelIndex < 4) {
                destImageData.data[i + destChannel] = imageData.data[i + channelIndex];
            }
        }
        this._context.putImageData(destImageData, destPoint.x, destPoint.y);
    }
    colorTransform(rect, transform) {
        if (!this._context)
            return;
        const imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
        const data = imageData.data;
        const rm = transform.redMultiplier ?? 1;
        const gm = transform.greenMultiplier ?? 1;
        const bm = transform.blueMultiplier ?? 1;
        const am = transform.alphaMultiplier ?? 1;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] * rm)); // R
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * gm)); // G
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * bm)); // B
            data[i + 3] = Math.min(255, Math.max(0, data[i + 3] * am)); // A
        }
        this._context.putImageData(imageData, rect.x, rect.y);
    }
    applyFilter(source, sourceRect, destPoint, filter) {
        if (!this._context || !source._context)
            return;
        // TODO: Implement filter application (ColorMatrixFilter, etc.)
        // For now, just copy pixels
        this.copyPixels(source, sourceRect, destPoint);
    }
    dispose() {
        this._canvas = null;
        this._context = null;
        this._imageData = null;
        this._buffer = null;
    }
    toBuffer(format = "png") {
        if (!this._canvas) {
            return Promise.resolve(Buffer.alloc(0));
        }
        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        return new Promise((resolve, reject) => {
            const canvas = this._canvas;
            canvas.toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(buffer);
                }
            }, mimeType);
        });
    }
    argbToRgba(argb) {
        return {
            a: (argb >>> 24) & 0xFF,
            r: (argb >>> 16) & 0xFF,
            g: (argb >>> 8) & 0xFF,
            b: argb & 0xFF
        };
    }
    static fromBuffer(buffer, width, height) {
        // This would need to be implemented with an image library
        // For now, return a placeholder
        const bmp = new BitmapData(width, height, true);
        return Promise.resolve(bmp);
    }
}
exports.BitmapData = BitmapData;

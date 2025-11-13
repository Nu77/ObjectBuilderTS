/*
*  BitmapData abstraction for TypeScript
*  Replaces Flash's flash.display.BitmapData
*/

import { createCanvas, Canvas, CanvasRenderingContext2D } from "canvas";
import { Sharp } from "sharp";

export class BitmapData {
    private _width: number;
    private _height: number;
    private _transparent: boolean;
    private _canvas: Canvas | null = null;
    private _context: CanvasRenderingContext2D | null = null;
    private _imageData: ImageData | null = null;
    private _buffer: Buffer | null = null;

    constructor(width: number, height: number, transparent: boolean = true, fillColor: number = 0x00000000) {
        this._width = width;
        this._height = height;
        this._transparent = transparent;
        
        this._canvas = createCanvas(width, height);
        this._context = this._canvas.getContext("2d");
        
        if (fillColor !== 0x00000000) {
            this.fillRect(0, 0, width, height, fillColor);
        }
    }

    public get width(): number { return this._width; }
    public get height(): number { return this._height; }
    public get transparent(): boolean { return this._transparent; }
    public get rect(): { x: number; y: number; width: number; height: number } {
        return { x: 0, y: 0, width: this._width, height: this._height };
    }

    public fillRect(x: number, y: number, width: number, height: number, color: number): void {
        if (!this._context) return;
        
        const rgba = this.argbToRgba(color);
        this._context.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255})`;
        this._context.fillRect(x, y, width, height);
    }

    public setPixels(rect: { x: number; y: number; width: number; height: number }, pixels: Buffer | Uint8Array): void {
        if (!this._context) return;
        
        const imageData = this._context.createImageData(rect.width, rect.height);
        const data = pixels instanceof Buffer ? new Uint8Array(pixels) : pixels;
        
        for (let i = 0; i < data.length && i < imageData.data.length; i++) {
            imageData.data[i] = data[i];
        }
        
        this._context.putImageData(imageData, rect.x, rect.y);
    }

    public getPixels(rect: { x: number; y: number; width: number; height: number }): Buffer {
        if (!this._context) {
            return Buffer.alloc(rect.width * rect.height * 4);
        }
        
        const imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
        return Buffer.from(imageData.data);
    }

    public copyPixels(source: BitmapData, 
                     sourceRect: { x: number; y: number; width: number; height: number },
                     destPoint: { x: number; y: number },
                     alphaBitmap: BitmapData | null = null,
                     alphaPoint: { x: number; y: number } | null = null,
                     mergeAlpha: boolean = false): void {
        if (!this._context || !source._canvas) return;
        
        if (mergeAlpha && alphaBitmap && alphaBitmap._canvas) {
            // Handle alpha blending
            this._context.globalCompositeOperation = "source-over";
        }
        
        this._context.drawImage(
            source._canvas as any,
            sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
            destPoint.x, destPoint.y, sourceRect.width, sourceRect.height
        );
    }

    public clone(): BitmapData {
        const cloned = new BitmapData(this._width, this._height, this._transparent);
        if (this._canvas && cloned._context) {
            cloned._context.drawImage(this._canvas as any, 0, 0);
        }
        return cloned;
    }

    public copyChannel(source: BitmapData,
                      sourceRect: { x: number; y: number; width: number; height: number },
                      destPoint: { x: number; y: number },
                      sourceChannel: number,
                      destChannel: number): void {
        if (!this._context || !source._context) return;
        
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

    public colorTransform(rect: { x: number; y: number; width: number; height: number },
                         transform: { redMultiplier?: number; greenMultiplier?: number; blueMultiplier?: number; alphaMultiplier?: number }): void {
        if (!this._context) return;
        
        const imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
        const data = imageData.data;
        
        const rm = transform.redMultiplier ?? 1;
        const gm = transform.greenMultiplier ?? 1;
        const bm = transform.blueMultiplier ?? 1;
        const am = transform.alphaMultiplier ?? 1;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] * rm));     // R
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * gm)); // G
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * bm)); // B
            data[i + 3] = Math.min(255, Math.max(0, data[i + 3] * am)); // A
        }
        
        this._context.putImageData(imageData, rect.x, rect.y);
    }

    public applyFilter(source: BitmapData,
                      sourceRect: { x: number; y: number; width: number; height: number },
                      destPoint: { x: number; y: number },
                      filter: any): void {
        if (!this._context || !source._context) return;
        
        // TODO: Implement filter application (ColorMatrixFilter, etc.)
        // For now, just copy pixels
        this.copyPixels(source, sourceRect, destPoint);
    }

    public dispose(): void {
        this._canvas = null;
        this._context = null;
        this._imageData = null;
        this._buffer = null;
    }

    public toBuffer(format: "png" | "jpg" = "png"): Promise<Buffer> {
        if (!this._canvas) {
            return Promise.resolve(Buffer.alloc(0));
        }
        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        return new Promise((resolve, reject) => {
            const canvas = this._canvas!;
            (canvas.toBuffer as any)((err: Error | null, buffer: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            }, mimeType);
        });
    }

    private argbToRgba(argb: number): { r: number; g: number; b: number; a: number } {
        return {
            a: (argb >>> 24) & 0xFF,
            r: (argb >>> 16) & 0xFF,
            g: (argb >>> 8) & 0xFF,
            b: argb & 0xFF
        };
    }

    public static fromBuffer(buffer: Buffer, width: number, height: number): Promise<BitmapData> {
        // This would need to be implemented with an image library
        // For now, return a placeholder
        const bmp = new BitmapData(width, height, true);
        return Promise.resolve(bmp);
    }
}


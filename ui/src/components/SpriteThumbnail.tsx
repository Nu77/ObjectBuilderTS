import React, { useRef, useEffect } from 'react';
import './SpriteThumbnail.css';

interface SpriteThumbnailProps {
  pixels?: Uint8Array | ArrayBuffer | any;
  size?: number;
  scale?: number;
  className?: string;
}

export const SpriteThumbnail: React.FC<SpriteThumbnailProps> = ({
  pixels,
  size = 32,
  scale = 1,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pixels || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set background
    ctx.fillStyle = '#636363';
    ctx.fillRect(0, 0, size, size);

    try {
      // Convert various pixel data formats to Uint8Array
      let pixelData: Uint8Array;
      
      if (pixels instanceof ArrayBuffer) {
        pixelData = new Uint8Array(pixels);
      } else if (Buffer.isBuffer && Buffer.isBuffer(pixels)) {
        // Node.js Buffer (shouldn't happen in browser, but handle it)
        pixelData = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
      } else if (pixels instanceof Uint8Array) {
        pixelData = pixels;
      } else if (pixels && pixels.buffer instanceof ArrayBuffer) {
        // Typed array (Uint8Array, Int8Array, etc.)
        pixelData = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
      } else if (Array.isArray(pixels)) {
        // Plain array
        pixelData = new Uint8Array(pixels);
      } else {
        console.warn('Unknown pixel data format:', typeof pixels);
        return;
      }
      
      // Check if we have valid pixel data
      if (!pixelData || pixelData.length < 4) {
        return;
      }

      // Create ImageData for the sprite
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      // Convert RGBA pixels to ImageData
      // Sprites are typically 32x32 = 1024 pixels = 4096 bytes (RGBA)
      const expectedLength = size * size * 4;
      const pixelLength = Math.min(pixelData.length, expectedLength);

      for (let i = 0; i < pixelLength; i += 4) {
        const idx = i;
        if (idx < data.length) {
          data[idx] = pixelData[i] || 0;         // R
          data[idx + 1] = pixelData[i + 1] || 0; // G
          data[idx + 2] = pixelData[i + 2] || 0; // B
          data[idx + 3] = pixelData[i + 3] !== undefined ? pixelData[i + 3] : 255; // A
        }
      }

      // Put image data on canvas
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('Error rendering sprite thumbnail:', error);
      // Show placeholder on error
      ctx.fillStyle = '#999999';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', size / 2, size / 2);
    }
  }, [pixels, size]);

  const displaySize = size * scale;

  return (
    <div className={`sprite-thumbnail ${className}`} style={{ width: displaySize, height: displaySize }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="sprite-thumbnail-canvas"
        style={{
          width: displaySize,
          height: displaySize,
          imageRendering: 'pixelated', // Keep pixel art crisp
        }}
      />
    </div>
  );
};


import React, { useRef, useEffect, useState } from 'react';
import './PreviewCanvas.css';

interface PreviewCanvasProps {
  thingData?: any;
  width?: number;
  height?: number;
  frameGroupType?: number; // FrameGroupType (0 = DEFAULT, etc.)
  patternX?: number;
  patternY?: number;
  patternZ?: number;
  animate?: boolean;
  zoom?: number;
  currentFrame?: number;
  onFrameChange?: (frame: number) => void; // Reserved for future use
  showAllPatterns?: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  thingData,
  width = 256,
  height = 256,
  frameGroupType = 0, // DEFAULT
  patternX = 0,
  patternY = 0,
  patternZ = 0,
  animate = false,
  zoom = 1,
  currentFrame: currentFrameProp,
  onFrameChange: _onFrameChange,
  showAllPatterns = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [internalFrame, setInternalFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Use prop frame when not animating, internal frame when animating
  const currentFrame = animate ? internalFrame : (currentFrameProp !== undefined ? currentFrameProp : 0);
  
  // Sync internal frame with prop when not animating
  useEffect(() => {
    if (!animate && currentFrameProp !== undefined) {
      setInternalFrame(currentFrameProp);
    }
  }, [currentFrameProp, animate]);

  useEffect(() => {
    if (!thingData || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render at zoomed size for proper scaling
    const zoomedWidth = width * zoom;
    const zoomedHeight = height * zoom;
    renderThing(ctx, thingData, zoomedWidth, zoomedHeight, frameGroupType, patternX, patternY, patternZ, currentFrame, showAllPatterns, zoom);
  }, [thingData, width, height, frameGroupType, patternX, patternY, patternZ, currentFrame, showAllPatterns, zoom]);

  // Animation effect
  useEffect(() => {
    if (!animate || !thingData) {
      setIsAnimating(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setInternalFrame(0);
      return;
    }

    // Get frame group to determine animation properties
    const frameGroup = thingData.thing?.frameGroups?.[frameGroupType];
    if (!frameGroup || !frameGroup.isAnimation || frameGroup.frames <= 1) {
      setIsAnimating(false);
      setInternalFrame(0);
      return;
    }

    setIsAnimating(true);
    let frame = internalFrame;
    let lastTime = performance.now();
    let accumulatedTime = 0;
    let loopCount = 0;
    const maxLoops = frameGroup.loopCount > 0 ? frameGroup.loopCount : Infinity;

    const animateFrame = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      accumulatedTime += deltaTime;

      // Get frame duration
      let duration = 100; // Default duration
      if (frameGroup.frameDurations && frameGroup.frameDurations[frame]) {
        const frameDuration = frameGroup.frameDurations[frame];
        // Use average of min and max, or random between them for asynchronous mode
        // AnimationMode.ASYNCHRONOUS = 0, SYNCHRONOUS = 1
        if (frameGroup.animationMode === 0) { // ASYNCHRONOUS
          const min = frameDuration.minimum || 100;
          const max = frameDuration.maximum || 100;
          duration = min + Math.random() * (max - min);
        } else { // SYNCHRONOUS
          duration = ((frameDuration.minimum || 100) + (frameDuration.maximum || 100)) / 2;
        }
      }

      if (accumulatedTime >= duration) {
        accumulatedTime = 0;
        frame = (frame + 1) % frameGroup.frames;
        
        // Check if we've completed a loop
        if (frame === 0) {
          loopCount++;
          if (loopCount >= maxLoops) {
            // Stop animation after max loops
            setIsAnimating(false);
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            return;
          }
        }
        
        setInternalFrame(frame);
      }

      animationFrameRef.current = requestAnimationFrame(animateFrame);
    };

    animationFrameRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [animate, thingData, frameGroupType]);

  const renderThing = (
    ctx: CanvasRenderingContext2D,
    thingData: any,
    canvasWidth: number,
    canvasHeight: number,
    groupType: number,
    px: number,
    py: number,
    pz: number,
    frame: number,
    showAllPatterns: boolean = false,
    zoom: number = 1
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set background
    ctx.fillStyle = '#636363';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Scale context by zoom so content renders at correct size
    // canvasWidth/Height are already zoomed, so we need to scale by zoom
    // to render base-size content that appears zoomed
    ctx.save();
    ctx.scale(zoom, zoom);
    
    // Now render at base size - all coordinates will be automatically scaled
    const baseWidth = canvasWidth / zoom;
    const baseHeight = canvasHeight / zoom;

    if (!thingData) {
      renderPlaceholder(ctx, baseWidth, baseHeight);
      ctx.restore();
      return;
    }

    // Try to get frame group from thing
    const frameGroup = thingData.thing?.frameGroups?.[groupType];
    if (!frameGroup) {
      // Fallback to simple sprite rendering
      if (thingData.sprites && thingData.sprites.length > 0) {
        renderSprites(ctx, thingData.sprites, baseWidth, baseHeight);
      } else if (thingData.pixels) {
        renderSpritePixels(ctx, thingData.pixels, baseWidth, baseHeight);
      } else {
        renderPlaceholder(ctx, baseWidth, baseHeight);
      }
      ctx.restore();
      return;
    }

    // Get sprites for this frame group
    let groupSprites: any[] = [];
    if (thingData.sprites) {
      if (thingData.sprites instanceof Map) {
        // If it's a Map, get sprites for the frame group type
        groupSprites = thingData.sprites.get(groupType) || [];
      } else if (Array.isArray(thingData.sprites)) {
        // If it's an array, use it directly (legacy format)
        groupSprites = thingData.sprites;
      } else if (typeof thingData.sprites === 'object') {
        // If it's an object with numeric keys
        groupSprites = thingData.sprites[groupType] || thingData.sprites[0] || [];
      }
    }
    
    if (!groupSprites || groupSprites.length === 0) {
      renderPlaceholder(ctx, baseWidth, baseHeight);
      ctx.restore();
      return;
    }

    // Render multi-sprite composition
    // Show all patterns only if explicitly requested
    renderFrameGroup(ctx, frameGroup, groupSprites, baseWidth, baseHeight, px, py, pz, frame, showAllPatterns);
    ctx.restore();
  };

	const renderFrameGroup = (
		ctx: CanvasRenderingContext2D,
		frameGroup: any,
		sprites: any[],
		canvasWidth: number,
		canvasHeight: number,
		px: number,
		py: number,
		pz: number,
		frame: number,
		showAllPatterns: boolean = false
	) => {
    const spriteSize = frameGroup.exactSize || 32;
    const patternX = frameGroup.patternX || 1;
    const patternY = frameGroup.patternY || 1;
    const patternZ = frameGroup.patternZ || 1;
    const frames = frameGroup.frames || 1;

    // If showing all patterns, render a grid of patternX x patternY
    if (showAllPatterns && (patternX > 1 || patternY > 1)) {
      const gridCols = patternX;
      const gridRows = patternY;
      const width = frameGroup.width || 1;
      const height = frameGroup.height || 1;
      const cellWidth = width * spriteSize;
      const cellHeight = height * spriteSize;
      const gridWidth = gridCols * cellWidth;
      const gridHeight = gridRows * cellHeight;
      
      // Scale to fit canvas (canvas is already at base size due to zoom scaling in renderThing)
      // We want to fit the grid within the available canvas space
      const scaleX = canvasWidth / gridWidth;
      const scaleY = canvasHeight / gridHeight;
      let scale = Math.min(scaleX, scaleY); // Allow scaling to fit
      
      // Ensure scale is not zero or too small, but allow it to be less than 1 to fit
      if (scale <= 0 || !isFinite(scale)) {
        scale = 0.1; // Fallback minimum scale
      }
      
      // Calculate cell dimensions after scaling
      const scaledCellWidth = cellWidth * scale;
      const scaledCellHeight = cellHeight * scale;
      const scaledGridWidth = gridWidth * scale;
      const scaledGridHeight = gridHeight * scale;
      
      // Center the grid on canvas
      const startX = Math.max(0, (canvasWidth - scaledGridWidth) / 2);
      const startY = Math.max(0, (canvasHeight - scaledGridHeight) / 2);
      
      // Render each cell in the grid
			for (let pyIdx = 0; pyIdx < gridRows; pyIdx++) {
				for (let pxIdx = 0; pxIdx < gridCols; pxIdx++) {
          // Calculate cell position
          const cellX = startX + pxIdx * scaledCellWidth;
          const cellY = startY + pyIdx * scaledCellHeight;
          
          // Render this pattern variation in its cell
          // For patternY (addons), combine base with the patternY layer
					if (patternY > 1 && pyIdx > 0) {
						// Render base (patternY=0) first, scaled and positioned
						ctx.save();
						ctx.translate(cellX, cellY);
						ctx.scale(scale, scale);
						renderSinglePattern(ctx, frameGroup, sprites, cellWidth, cellHeight, pxIdx, 0, pz, frame, 0, 0);
						ctx.restore();

						// Then overlay only the current patternY layer for this cell
						ctx.save();
						ctx.translate(cellX, cellY);
						ctx.scale(scale, scale);
						renderSinglePattern(ctx, frameGroup, sprites, cellWidth, cellHeight, pxIdx, pyIdx, pz, frame, 0, 0, false);
						ctx.restore();
					} else {
						// No patternY variations or base layer, just render the single pattern
						ctx.save();
						ctx.translate(cellX, cellY);
						ctx.scale(scale, scale);
						renderSinglePattern(ctx, frameGroup, sprites, cellWidth, cellHeight, pxIdx, pyIdx, pz, frame, 0, 0);
						ctx.restore();
					}
        }
      }
      return;
    }

    // Clamp pattern values
    const pxClamped = Math.max(0, Math.min(px, patternX - 1));
    const pyClamped = Math.max(0, Math.min(py, patternY - 1));
    const pzClamped = Math.max(0, Math.min(pz, patternZ - 1));
    const frameClamped = frame % frames;

    // Calculate composition bounds
    const width = frameGroup.width || 1;
    const height = frameGroup.height || 1;
    const totalWidth = width * spriteSize;
    const totalHeight = height * spriteSize;

    // Center the composition on canvas
    const offsetX = (canvasWidth - totalWidth) / 2;
    const offsetY = (canvasHeight - totalHeight) / 2;
    
	// Render the selected composition. When patternY has multiple layers, we combine base + addon layers up to the
	// selected pattern value to mimic the in-game appearance.
	renderSinglePattern(ctx, frameGroup, sprites, totalWidth, totalHeight, pxClamped, pyClamped, pzClamped, frameClamped, offsetX, offsetY);
  };

	const renderSinglePattern = (
		ctx: CanvasRenderingContext2D,
		frameGroup: any,
		sprites: any[],
		_totalWidth: number,
		_totalHeight: number,
		px: number,
		py: number,
		pz: number,
		frame: number,
		offsetX: number = 0,
		offsetY: number = 0,
		stackAddonLayers: boolean = true
	) => {
		const spriteSize = frameGroup.exactSize || 32;
		const layers = frameGroup.layers || 1;
		const width = frameGroup.width || 1;
		const height = frameGroup.height || 1;
		const frames = frameGroup.frames || 1;
		const patternX = frameGroup.patternX || 1;
		const patternY = frameGroup.patternY || 1;
		const patternZ = frameGroup.patternZ || 1;

		const pxClamped = Math.max(0, Math.min(px, patternX - 1));
		const pyClamped = Math.max(0, Math.min(py, patternY - 1));
		const pzClamped = Math.max(0, Math.min(pz, patternZ - 1));
		const frameClamped = frame % frames;

		// Helper function to calculate sprite index using FrameGroup formula
		const getSpriteIndex = (w: number, h: number, l: number, px: number, py: number, pz: number, f: number): number => {
			if (typeof frameGroup.getSpriteIndex === 'function') {
				return frameGroup.getSpriteIndex(w, h, l, px, py, pz, f);
			}
			// Fallback calculation using the same formula as FrameGroup.getSpriteIndex
			// Formula: ((((((frame % frames) * patternZ + pz) * patternY + py) * patternX + px) * layers + l) * height + h) * width + w
			const frameMod = f % frames;
			const step1 = frameMod * patternZ + pz;
			const step2 = step1 * patternY + py;
			const step3 = step2 * patternX + px;
			const step4 = step3 * layers + l;
			const step5 = step4 * height + h;
			const step6 = step5 * width + w;
			return step6;
		};

		const renderLayer = (pyValue: number) => {
			for (let l = 0; l < layers; l++) {
				for (let w = 0; w < width; w++) {
					for (let h = 0; h < height; h++) {
						const spriteIndex = getSpriteIndex(w, h, l, pxClamped, pyValue, pzClamped, frameClamped);

						if (spriteIndex >= 0 && spriteIndex < sprites.length) {
							const spriteData = sprites[spriteIndex];
							if (spriteData) {
								let pixels: Uint8Array | ArrayBuffer | null = null;

								if (spriteData.pixels) {
									if (spriteData.pixels instanceof ArrayBuffer) {
										pixels = spriteData.pixels;
									} else if (spriteData.pixels instanceof Uint8Array) {
										pixels = spriteData.pixels.buffer;
									} else if (Buffer.isBuffer && Buffer.isBuffer(spriteData.pixels)) {
										const buffer = spriteData.pixels.buffer;
										pixels = buffer instanceof ArrayBuffer ? buffer.slice(
											spriteData.pixels.byteOffset,
											spriteData.pixels.byteOffset + spriteData.pixels.byteLength
										) : new Uint8Array(spriteData.pixels).buffer;
									} else {
										pixels = spriteData.pixels;
									}
								} else if (spriteData instanceof ArrayBuffer) {
									pixels = spriteData;
								} else if (spriteData instanceof Uint8Array) {
									pixels = spriteData.buffer instanceof ArrayBuffer ? spriteData.buffer : null;
								} else if (Buffer.isBuffer && Buffer.isBuffer(spriteData)) {
									const buffer = spriteData.buffer;
									if (buffer instanceof ArrayBuffer) {
										pixels = buffer.slice(
											spriteData.byteOffset,
											spriteData.byteOffset + spriteData.byteLength
										);
									} else {
										pixels = new Uint8Array(spriteData).buffer;
									}
								} else if (Array.isArray(spriteData)) {
									pixels = new Uint8Array(spriteData).buffer;
								}

								if (pixels) {
									const x = offsetX + (width - w - 1) * spriteSize;
									const y = offsetY + (height - h - 1) * spriteSize;

									renderSpritePixelsAt(ctx, pixels, x, y, spriteSize);
								}
							}
						}
					}
				}
			}
		};

		if (patternY > 1 && stackAddonLayers) {
			renderLayer(0);

			for (let pyIdx = 1; pyIdx <= pyClamped; pyIdx++) {
				renderLayer(pyIdx);
			}
		} else {
			renderLayer(pyClamped);
		}
	};

  const renderSpritePixelsAt = (
    ctx: CanvasRenderingContext2D,
    pixels: Uint8Array | ArrayBuffer | Buffer,
    x: number,
    y: number,
    size: number
  ) => {
    try {
      let pixelData: Uint8Array;
      if (pixels instanceof ArrayBuffer) {
        pixelData = new Uint8Array(pixels);
      } else if (Buffer.isBuffer && Buffer.isBuffer(pixels)) {
        pixelData = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
      } else if (pixels instanceof Uint8Array) {
        pixelData = pixels;
      } else {
        console.warn('Unknown pixel data format:', typeof pixels);
        return;
      }

      // Validate pixel data length
      const expectedLength = size * size * 4;
      if (pixelData.length < expectedLength) {
        console.warn(`Sprite pixel data too short: expected ${expectedLength} bytes, got ${pixelData.length}`);
        // Fill with transparent pixels if data is incomplete
        const imageData = ctx.createImageData(size, size);
        ctx.putImageData(imageData, x, y);
        return;
      }

      // Create ImageData for the sprite
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      // Convert ARGB pixels to RGBA ImageData
      // Tibia sprites use ARGB format (Alpha, Red, Green, Blue), not RGBA
      const pixelCount = size * size;
      for (let i = 0; i < pixelCount; i++) {
        const argbIndex = i * 4;
        const rgbaIndex = i * 4;
        
        if (argbIndex + 3 < pixelData.length && rgbaIndex + 3 < data.length) {
          // Convert from ARGB to RGBA for canvas ImageData
          const a = pixelData[argbIndex] ?? 255;
          const r = pixelData[argbIndex + 1] || 0;
          const g = pixelData[argbIndex + 2] || 0;
          const b = pixelData[argbIndex + 3] || 0;
          
          data[rgbaIndex] = r;     // R
          data[rgbaIndex + 1] = g;  // G
          data[rgbaIndex + 2] = b;  // B
          data[rgbaIndex + 3] = a;  // A
        }
      }

      ctx.putImageData(imageData, x, y);
    } catch (error) {
      console.error('Error rendering sprite pixels:', error);
    }
  };

  const renderSpritePixels = (
    ctx: CanvasRenderingContext2D,
    pixels: Uint8Array | ArrayBuffer | Buffer,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const spriteSize = 32;
    const x = (canvasWidth - spriteSize) / 2;
    const y = (canvasHeight - spriteSize) / 2;
    renderSpritePixelsAt(ctx, pixels, x, y, spriteSize);
  };

  const renderSprites = (
    ctx: CanvasRenderingContext2D,
    sprites: any[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // Render all sprites layered on top of each other
    const spriteSize = 32;
    const x = (canvasWidth - spriteSize) / 2;
    const y = (canvasHeight - spriteSize) / 2;

    for (const sprite of sprites) {
      if (sprite && sprite.pixels) {
        renderSpritePixelsAt(ctx, sprite.pixels, x, y, spriteSize);
      }
    }
  };

  const renderPlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No preview available', width / 2, height / 2);
  };

  // Canvas should be rendered at zoomed size for proper pixel rendering
  const canvasWidth = width * zoom;
  const canvasHeight = height * zoom;

  return (
    <div className="preview-canvas-container" title="PreviewCanvas component">
			<div 
				className="preview-canvas-wrapper"
				title="preview-canvas-wrapper"
				style={{
					minWidth: canvasWidth,
					minHeight: canvasHeight,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					overflow: 'auto',
				}}
			>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="preview-canvas"
          title="preview-canvas (HTMLCanvasElement)"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            imageRendering: 'pixelated',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </div>
      {isAnimating && (
        <div className="preview-animation-indicator" title="preview-animation-indicator (Animation playing)">
          ●
        </div>
      )}
    </div>
  );
};

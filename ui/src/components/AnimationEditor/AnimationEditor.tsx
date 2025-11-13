import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationEditorToolbar } from './AnimationEditorToolbar';
import { Frame } from './Frame';
import { FileDialogService } from '../../services/FileDialogService';
import { useToast } from '../../hooks/useToast';
import { useWorker } from '../../contexts/WorkerContext';
import { useProgress } from '../../contexts/ProgressContext';
import { PreviewCanvas } from '../PreviewCanvas';
import { Button } from '../Button';
import { getImageProcessingService } from '../../services/ImageProcessingService';
import { CommandFactory } from '../../services/CommandFactory';
import './AnimationEditor.css';

interface AnimationEditorProps {
	onClose?: () => void;
}

type ThingCategory = 'item' | 'outfit' | 'effect' | 'missile';

export const AnimationEditor: React.FC<AnimationEditorProps> = ({ onClose: _onClose }) => {
	const { showError, showSuccess } = useToast();
	const worker = useWorker();
	const { showProgress, hideProgress } = useProgress();
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [frames, setFrames] = useState<Frame[]>([]);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(-1);
	const [zoom, setZoom] = useState<number>(1.0);
	const [offsetX, setOffsetX] = useState<number>(0);
	const [offsetY, setOffsetY] = useState<number>(0);
	const [frameWidth, setFrameWidth] = useState<number>(32);
	const [frameHeight, setFrameHeight] = useState<number>(32);
	const [columns, setColumns] = useState<number>(1);
	const [rows, setRows] = useState<number>(1);
	const [category, setCategory] = useState<ThingCategory>('item');
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [currentFrame, setCurrentFrame] = useState<number>(0);
	const [thingData, setThingData] = useState<any>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);
	const gridOverlayRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const fileDialog = FileDialogService.getInstance();
	const imageProcessingService = getImageProcessingService();

	// Load image from file
	const handleOpenFile = useCallback(async () => {
		try {
			const result = await fileDialog.openImageFiles();
			if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
				const filePath = result.filePaths[0];
				const img = new Image();
				img.onload = () => {
					setImage(img);
					setOffsetX(0);
					setOffsetY(0);
					setFrames([]);
					setThingData(null);
				};
				img.onerror = () => {
					showError('Failed to load image file');
				};
				// Use Electron API to read file if available, otherwise use file:// protocol
				const electronAPI = (window as any).electronAPI;
				if (electronAPI && electronAPI.readFile) {
					try {
						const fileData = await electronAPI.readFile(filePath);
						if (fileData && fileData.data) {
							// Convert ArrayBuffer to blob URL
							const blob = new Blob([fileData.data], { type: 'image/png' });
							img.src = URL.createObjectURL(blob);
						} else {
							// Fallback to file:// protocol
							img.src = `file://${filePath}`;
						}
					} catch (err) {
						// Fallback to file:// protocol
						img.src = `file://${filePath}`;
					}
				} else {
					// Fallback: try file:// protocol or use FileReader
					const fs = (window as any).require ? (window as any).require('fs') : null;
					if (fs) {
						try {
							const buffer = fs.readFileSync(filePath);
							const blob = new Blob([buffer], { type: 'image/png' });
							img.src = URL.createObjectURL(blob);
						} catch (err) {
							img.src = `file://${filePath}`;
						}
					} else {
						img.src = `file://${filePath}`;
					}
				}
			}
		} catch (error: any) {
			showError(`Failed to open file: ${error.message}`);
		}
	}, [fileDialog, showError]);

	// Handle paste from clipboard
	const handlePaste = useCallback(async () => {
		try {
			const clipboardItems = await navigator.clipboard.read();
			for (const item of clipboardItems) {
				if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
					const blob = await item.getType('image/png');
					const img = new Image();
					img.onload = () => {
						setImage(img);
						setOffsetX(0);
						setOffsetY(0);
						setFrames([]);
						setThingData(null);
					};
					img.src = URL.createObjectURL(blob);
					return;
				}
			}
			showError('No image found in clipboard');
		} catch (error: any) {
			showError(`Failed to paste from clipboard: ${error.message}`);
		}
	}, [showError]);

	// Rotate image
	const rotateImage = useCallback(async (degrees: number) => {
		if (!image || isProcessing) return;

		setIsProcessing(true);
		try {
			// Get image data from canvas
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			const imageData = ctx.getImageData(0, 0, image.width, image.height);

			// Process in worker
			const rotatedImageData = await imageProcessingService.rotateImage(imageData, degrees);

			// Convert back to image
			const resultCanvas = document.createElement('canvas');
			const resultCtx = resultCanvas.getContext('2d');
			if (!resultCtx) return;

			resultCanvas.width = rotatedImageData.width;
			resultCanvas.height = rotatedImageData.height;
			resultCtx.putImageData(rotatedImageData, 0, 0);

			const newImg = new Image();
			newImg.onload = () => {
				setImage(newImg);
				setIsProcessing(false);
			};
			newImg.onerror = () => {
				showError('Failed to rotate image');
				setIsProcessing(false);
			};
			newImg.src = resultCanvas.toDataURL();
		} catch (error: any) {
			showError(`Failed to rotate image: ${error.message}`);
			setIsProcessing(false);
		}
	}, [image, isProcessing, imageProcessingService, showError]);

	// Flip image
	const flipImage = useCallback(async (horizontal: boolean, vertical: boolean) => {
		if (!image || isProcessing) return;

		setIsProcessing(true);
		try {
			// Get image data from canvas
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			const imageData = ctx.getImageData(0, 0, image.width, image.height);

			// Process in worker
			const flippedImageData = await imageProcessingService.flipImage(imageData, horizontal, vertical);

			// Convert back to image
			const resultCanvas = document.createElement('canvas');
			const resultCtx = resultCanvas.getContext('2d');
			if (!resultCtx) return;

			resultCanvas.width = flippedImageData.width;
			resultCanvas.height = flippedImageData.height;
			resultCtx.putImageData(flippedImageData, 0, 0);

			const newImg = new Image();
			newImg.onload = () => {
				setImage(newImg);
				setIsProcessing(false);
			};
			newImg.onerror = () => {
				showError('Failed to flip image');
				setIsProcessing(false);
			};
			newImg.src = resultCanvas.toDataURL();
		} catch (error: any) {
			showError(`Failed to flip image: ${error.message}`);
			setIsProcessing(false);
		}
	}, [image, isProcessing, imageProcessingService, showError]);

	// Cut frames from image
	const handleCutFrames = useCallback(async () => {
		if (!image || isProcessing) return;

		setIsProcessing(true);
		try {
			// Get full image data
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				setIsProcessing(false);
				return;
			}

			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			const fullImageData = ctx.getImageData(0, 0, image.width, image.height);

			// Process frames in worker (parallel processing)
			const frameImageDataList = await imageProcessingService.cutFrames(
				fullImageData,
				offsetX,
				offsetY,
				frameWidth,
				frameHeight,
				columns,
				rows
			);

			// Convert ImageData to Frame objects
			const newFrames: Frame[] = frameImageDataList.map(imageData => new Frame(imageData));

			setFrames([...frames, ...newFrames]);
			createThingData([...frames, ...newFrames]);
			setIsProcessing(false);
		} catch (error: any) {
			showError(`Failed to cut frames: ${error.message}`);
			setIsProcessing(false);
		}
	}, [image, offsetX, offsetY, frameWidth, frameHeight, columns, rows, frames, isProcessing, imageProcessingService, showError]);

	// Create thing data from frames
	const createThingData = useCallback((frameList: Frame[]) => {
		if (frameList.length === 0) {
			setThingData(null);
			return;
		}

		// Create a simplified thing data structure for preview
		// Full ThingData creation will happen on save
		setThingData({
			frames: frameList.length,
			category: category,
			thing: {
				category: category,
				frameGroups: {
					0: {
						frames: frameList.length,
						isAnimation: frameList.length > 1,
						width: Math.ceil(frameWidth / 32),
						height: Math.ceil(frameHeight / 32),
					}
				}
			}
		});
	}, [category, frameWidth, frameHeight]);

	// Handle grid drag
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (!image || !gridOverlayRef.current) return;
		const rect = gridOverlayRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setIsDragging(true);
		setDragStart({ x, y });
	}, [image]);

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!isDragging || !dragStart || !gridOverlayRef.current) return;
		const newX = Math.max(0, Math.min(image!.width - (columns * frameWidth), offsetX + (e.clientX - dragStart.x) / zoom));
		const newY = Math.max(0, Math.min(image!.height - (rows * frameHeight), offsetY + (e.clientY - dragStart.y) / zoom));
		setOffsetX(newX);
		setOffsetY(newY);
	}, [isDragging, dragStart, image, columns, rows, frameWidth, frameHeight, offsetX, offsetY, zoom]);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setDragStart(null);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 'o':
						e.preventDefault();
						handleOpenFile();
						break;
					case 's':
						e.preventDefault();
						handleSave();
						break;
					case 'v':
						e.preventDefault();
						handlePaste();
						break;
				}
			} else if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
				switch (e.key) {
					case 'ArrowLeft':
						if (image) {
							setOffsetX(Math.max(0, offsetX - 1));
						}
						break;
					case 'ArrowRight':
						if (image) {
							setOffsetX(Math.min(image.width - (columns * frameWidth), offsetX + 1));
						}
						break;
					case 'ArrowUp':
						if (image) {
							setOffsetY(Math.max(0, offsetY - 1));
						}
						break;
					case 'ArrowDown':
						if (image) {
							setOffsetY(Math.min(image.height - (rows * frameHeight), offsetY + 1));
						}
						break;
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleOpenFile, handlePaste, image, offsetX, offsetY, columns, rows, frameWidth, frameHeight]);

	// Update thing data when frames change
	useEffect(() => {
		createThingData(frames);
	}, [frames, createThingData]);

	// Cleanup worker pool on unmount
	useEffect(() => {
		return () => {
			// Worker pool is singleton and will be cleaned up when app closes
			// Individual cleanup not needed as pool is shared
		};
	}, []);

	// Save animation as thing to project
	const handleSave = useCallback(async () => {
		if (frames.length === 0 || isSaving) {
			return;
		}

		setIsSaving(true);
		showProgress('Saving animation...');

		try {
			// Convert frames to sprite pixel data and create temporary OBD file
			// This is complex - we'll use a backend IPC handler to create ThingData
			// For now, we'll save frames as individual sprites and import them
			// Then create a thing with those sprites

			// Convert frames to temporary image files
			const tempFiles: string[] = [];
			const electronAPI = (window as any).electronAPI;

			for (let i = 0; i < frames.length; i++) {
				const frame = frames[i];
				const imageData = frame.imageData;
				if (!imageData) continue;

				// Convert ImageData to PNG
				const canvas = document.createElement('canvas');
				canvas.width = imageData.width;
				canvas.height = imageData.height;
				const ctx = canvas.getContext('2d');
				if (!ctx) continue;

				ctx.putImageData(imageData, 0, 0);
				const dataUrl = canvas.toDataURL('image/png');
				
				// Convert to ArrayBuffer
				const response = await fetch(dataUrl);
				const blob = await response.blob();
				const arrayBuffer = await blob.arrayBuffer();
				
				// Save to temp file
				if (electronAPI && electronAPI.writeTempFile) {
					const tempPath = await electronAPI.writeTempFile(`animation_frame_${i}.png`, arrayBuffer);
					tempFiles.push(tempPath);
				}
			}

			if (tempFiles.length === 0) {
				showError('Failed to create sprite files');
				setIsSaving(false);
				hideProgress();
				return;
			}

			// Import sprites first
			const importCommand = CommandFactory.createImportSpritesFromFilesCommand(tempFiles);
			const importResult = await worker.sendCommand(importCommand);

			if (!importResult.success) {
				showError(importResult.error || 'Failed to import sprites');
				setIsSaving(false);
				hideProgress();
				return;
			}

			// Now we need to create a ThingData with these sprites
			// This requires backend support - for now, show a message
			// The sprites are imported, but we need to create the thing separately
			showSuccess(`Imported ${tempFiles.length} sprite(s) from animation. Please create a thing manually using these sprites.`);
			setIsSaving(false);
			hideProgress();
		} catch (error: any) {
			showError(error.message || 'Failed to save animation');
			setIsSaving(false);
			hideProgress();
			console.error('Save animation error:', error);
		}
	}, [frames, isSaving, worker, showProgress, hideProgress, showSuccess, showError]);

	const canSave = thingData !== null && frames.length > 0 && !isSaving;

	return (
		<div className="animation-editor">
			<AnimationEditorToolbar
				onOpenFile={handleOpenFile}
				onSave={handleSave}
				onPaste={handlePaste}
				onRotateLeft={() => rotateImage(-90)}
				onRotateRight={() => rotateImage(90)}
				onFlipHorizontal={() => flipImage(true, false)}
				onFlipVertical={() => flipImage(false, true)}
				hasImage={image !== null}
				canSave={canSave}
			/>

			<div className="animation-editor-content">
				{/* Controls Panel */}
				<div className="animation-editor-controls">
					{/* Preview */}
					<div className="control-group">
						<label>Preview</label>
						<div className="preview-container">
							{thingData ? (
								<PreviewCanvas
									thingData={thingData}
									width={128}
									height={128}
									frameGroupType={0}
									patternX={1}
									patternY={1}
									patternZ={1}
									animate={isPlaying}
									zoom={1}
								/>
							) : (
								<div className="preview-placeholder">No animation</div>
							)}
						</div>
					</div>

					{/* Properties */}
					<div className="control-group">
						<label>Properties</label>
						<div className="property-grid">
							<label>Category:</label>
							<select value={category} onChange={(e) => setCategory(e.target.value as ThingCategory)}>
								<option value="item">Item</option>
								<option value="outfit">Outfit</option>
								<option value="effect">Effect</option>
								<option value="missile">Missile</option>
							</select>

							<label>X:</label>
							<input
								type="number"
								value={offsetX}
								onChange={(e) => setOffsetX(Math.max(0, parseInt(e.target.value) || 0))}
								min="0"
							/>

							<label>Y:</label>
							<input
								type="number"
								value={offsetY}
								onChange={(e) => setOffsetY(Math.max(0, parseInt(e.target.value) || 0))}
								min="0"
							/>

							<label>Width:</label>
							<input
								type="number"
								value={frameWidth}
								onChange={(e) => setFrameWidth(Math.max(32, parseInt(e.target.value) || 32))}
								min="32"
								step="32"
							/>

							<label>Height:</label>
							<input
								type="number"
								value={frameHeight}
								onChange={(e) => setFrameHeight(Math.max(32, parseInt(e.target.value) || 32))}
								min="32"
								step="32"
							/>

							<label>Columns:</label>
							<input
								type="number"
								value={columns}
								onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
								min="1"
							/>

							<label>Rows:</label>
							<input
								type="number"
								value={rows}
								onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
								min="1"
							/>
						</div>
					</div>

					{/* Zoom */}
					<div className="control-group">
						<label>Zoom</label>
						<input
							type="range"
							min="1.0"
							max="5.0"
							step="0.1"
							value={zoom}
							onChange={(e) => setZoom(parseFloat(e.target.value))}
						/>
						<span>{zoom.toFixed(1)}x</span>
					</div>

					<Button onClick={handleCutFrames} disabled={!image || isProcessing}>
						{isProcessing ? 'Processing...' : 'Crop'}
					</Button>
				</div>

				{/* Image Display Area */}
				<div className="animation-editor-image-area">
					<div
						className="image-container"
						ref={imageContainerRef}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					>
						{image && (
							<>
								<img
									src={image.src}
									alt="Animation source"
									style={{
										transform: `scale(${zoom})`,
										transformOrigin: 'top left',
									}}
								/>
								<div
									className="grid-overlay"
									ref={gridOverlayRef}
									onMouseDown={handleMouseDown}
									style={{
										left: `${offsetX * zoom}px`,
										top: `${offsetY * zoom}px`,
										width: `${columns * frameWidth * zoom}px`,
										height: `${rows * frameHeight * zoom}px`,
									}}
								/>
							</>
						)}
						{!image && (
							<div className="image-placeholder">
								Drop an image here or click "Open" to load an image
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Frame List */}
			<div className="animation-editor-frames">
				<div className="frames-list">
					{frames.map((_frame, index) => (
						<div
							key={index}
							className={`frame-item ${index === selectedFrameIndex ? 'selected' : ''}`}
							onClick={() => setSelectedFrameIndex(index)}
						>
							<div className="frame-thumbnail">
								{/* Frame thumbnail will be rendered here */}
							</div>
							<div className="frame-number">{index + 1}</div>
						</div>
					))}
					{frames.length === 0 && (
						<div className="frames-empty">No frames. Use "Crop" to extract frames from the image.</div>
					)}
				</div>
				<div className="frames-controls">
					<Button onClick={() => setCurrentFrame(0)} disabled={frames.length === 0}>
						◀◀
					</Button>
					<Button onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))} disabled={frames.length === 0}>
						◀
					</Button>
					<Button onClick={() => setIsPlaying(!isPlaying)} disabled={frames.length === 0}>
						{isPlaying ? '⏸' : '▶'}
					</Button>
					<Button onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))} disabled={frames.length === 0}>
						▶
					</Button>
					<Button onClick={() => setCurrentFrame(frames.length - 1)} disabled={frames.length === 0}>
						▶▶
					</Button>
				</div>
			</div>
		</div>
	);
};


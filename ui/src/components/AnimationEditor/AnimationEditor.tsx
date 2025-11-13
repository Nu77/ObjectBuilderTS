import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationEditorToolbar } from './AnimationEditorToolbar';
import { Frame, FrameDuration } from './Frame';
import { FileDialogService } from '../../services/FileDialogService';
import { useToast } from '../../hooks/useToast';
import { PreviewCanvas } from '../PreviewCanvas';
import { Button } from '../Button';
import './AnimationEditor.css';

interface AnimationEditorProps {
	onClose?: () => void;
}

type ThingCategory = 'item' | 'outfit' | 'effect' | 'missile';

export const AnimationEditor: React.FC<AnimationEditorProps> = ({ onClose }) => {
	const { showSuccess, showError } = useToast();
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

	const fileDialog = FileDialogService.getInstance();

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
	const rotateImage = useCallback((degrees: number) => {
		if (!image) return;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const radians = (degrees * Math.PI) / 180;
		const cos = Math.abs(Math.cos(radians));
		const sin = Math.abs(Math.sin(radians));
		canvas.width = image.width * cos + image.height * sin;
		canvas.height = image.width * sin + image.height * cos;

		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(radians);
		ctx.drawImage(image, -image.width / 2, -image.height / 2);

		const newImg = new Image();
		newImg.onload = () => {
			setImage(newImg);
		};
		newImg.src = canvas.toDataURL();
	}, [image]);

	// Flip image
	const flipImage = useCallback((horizontal: boolean, vertical: boolean) => {
		if (!image) return;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = image.width;
		canvas.height = image.height;

		ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
		ctx.drawImage(image, horizontal ? -image.width : 0, vertical ? -image.height : 0);

		const newImg = new Image();
		newImg.onload = () => {
			setImage(newImg);
		};
		newImg.src = canvas.toDataURL();
	}, [image]);

	// Cut frames from image
	const handleCutFrames = useCallback(() => {
		if (!image) return;

		const newFrames: Frame[] = [];
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = frameWidth;
		canvas.height = frameHeight;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < columns; c++) {
				const x = offsetX + (c * frameWidth);
				const y = offsetY + (r * frameHeight);

				if (x + frameWidth <= image.width && y + frameHeight <= image.height) {
					ctx.clearRect(0, 0, frameWidth, frameHeight);
					ctx.drawImage(image, x, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
					
					const imageData = ctx.getImageData(0, 0, frameWidth, frameHeight);
					// Remove magenta pixels (transparency)
					for (let i = 0; i < imageData.data.length; i += 4) {
						if (imageData.data[i] === 255 && 
							imageData.data[i + 1] === 0 && 
							imageData.data[i + 2] === 255) {
							imageData.data[i + 3] = 0; // Make transparent
						}
					}

					const frame = new Frame(imageData);
					newFrames.push(frame);
				}
			}
		}

		setFrames([...frames, ...newFrames]);
		createThingData([...frames, ...newFrames]);
	}, [image, offsetX, offsetY, frameWidth, frameHeight, columns, rows, frames]);

	// Create thing data from frames
	const createThingData = useCallback((frameList: Frame[]) => {
		if (frameList.length === 0) {
			setThingData(null);
			return;
		}

		// This will be implemented to create ThingData from frames
		// For now, we'll just set a placeholder
		setThingData({
			frames: frameList.length,
			category: category,
		});
	}, [category]);

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
		const rect = gridOverlayRef.current.getBoundingClientRect();
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
						// handleSave();
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

	const canSave = thingData !== null && frames.length > 0;

	return (
		<div className="animation-editor">
			<AnimationEditorToolbar
				onOpenFile={handleOpenFile}
				onSave={() => {/* TODO: Implement save */}}
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

					<Button onClick={handleCutFrames} disabled={!image}>
						Crop
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
					{frames.map((frame, index) => (
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


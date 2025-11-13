export interface FrameDuration {
	minimum: number;
	maximum: number;
}

export class Frame {
	private _bitmap: ImageBitmap | HTMLImageElement | null = null;
	private _imageData: ImageData | null = null;
	private _duration: FrameDuration | null = null;

	constructor(bitmap?: ImageBitmap | HTMLImageElement | ImageData) {
		if (bitmap instanceof ImageData) {
			this._imageData = bitmap;
		} else if (bitmap) {
			this._bitmap = bitmap;
		}
	}

	public get bitmap(): ImageBitmap | HTMLImageElement | null {
		return this._bitmap;
	}

	public get imageData(): ImageData | null {
		return this._imageData;
	}

	public get duration(): FrameDuration | null {
		return this._duration;
	}

	public set duration(value: FrameDuration | null) {
		this._duration = value;
	}

	public async getBitmap(): Promise<ImageBitmap | HTMLImageElement | null> {
		if (this._bitmap) {
			return this._bitmap;
		}

		if (this._imageData) {
			// Convert ImageData to ImageBitmap
			try {
				const bitmap = await createImageBitmap(this._imageData);
				this._bitmap = bitmap;
				return bitmap;
			} catch (error) {
				console.error('Failed to create ImageBitmap from ImageData:', error);
				return null;
			}
		}

		return null;
	}

	public clone(): Frame {
		const frame = new Frame(this._bitmap || this._imageData || undefined);
		if (this._duration) {
			frame._duration = { ...this._duration };
		}
		return frame;
	}
}


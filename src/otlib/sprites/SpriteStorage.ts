import { EventEmitter } from "events";
import { Version } from "../core/Version";
import { IStorage } from "../storages/IStorage";
import { StorageEvent } from "../storages/events/StorageEvent";
import { ChangeResult } from "../utils/ChangeResult";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { SpriteData } from "./SpriteData";
import { Sprite } from "./Sprite";
import { SpriteUtils } from "../utils/SpriteUtils";
import { SpriteExtent } from "../utils/SpriteExtent";
import { BitmapData } from "../utils/BitmapData";
import { Rect } from "../geom/Rect";
import { Resources } from "../resources/Resources";
import * as fs from "fs";
import * as path from "path";
import { ByteArray } from "../utils/ByteArray";
import { SpriteReader } from "./SpriteReader";
import { SpriteFileSize } from "./SpriteFileSize";

export class SpriteStorage extends EventEmitter implements IStorage {
    private _sprites: Map<number, Sprite> = new Map();
    private _spritesCount: number = 0;

    private _file: string | null = null;
    private _reader: SpriteReader | null = null;
    private _version: Version | null = null;
    private _signature: number = 0;
    private _extended: boolean = false;
    private _transparency: boolean = false;
    private _rect: Rect;
    private _blankSprite: Sprite | null = null;
    private _alertSprite: Sprite | null = null;
    private _headerSize: number = 0;
    private _changed: boolean = false;
    private _loaded: boolean = false;

    public get file(): string | null { return this._file; }
    public get version(): Version | null { return this._version; }
    public get signature(): number { return this._signature; }
    public get spritesCount(): number { return this._spritesCount; }
    public get loaded(): boolean { return this._loaded; }
    public get changed(): boolean { return this._changed; }
    public get isFull(): boolean { return (!this._extended && this._spritesCount === 0xFFFF); }
    public get transparency(): boolean { return this._transparency; }
    public get alertSprite(): Sprite | null { return this._alertSprite; }
    public get isTemporary(): boolean { return (this._loaded && this._file === null); }

    constructor() {
        super();
        this._rect = new Rect(0, 0, SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE);
    }

    public load(filePath: string, version: Version, extended: boolean, transparency: boolean): void {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (!version) {
            throw new Error("version cannot be null");
        }

        if (this.loaded) {
            return;
        }

        this.emit(ProgressEvent.PROGRESS, new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.SPRITES, 0, 100));
        this.onLoad(filePath, version, extended, transparency, false);
    }

    public createNew(version: Version, extended: boolean, transparency: boolean): void {
        if (!version) {
            throw new Error("version cannot be null");
        }

        if (this.loaded) return;

        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._signature = version.sprSignature;
        this._spritesCount = 1;
        this._headerSize = this._extended ? SpriteFileSize.HEADER_U32 : SpriteFileSize.HEADER_U16;
        this._transparency = transparency;
        this._blankSprite = new Sprite(0, transparency);
        this._alertSprite = this.createAlertSprite(transparency);
        this._sprites = new Map();
        this._sprites.set(0, this._blankSprite!);
        this._sprites.set(1, new Sprite(1, transparency));
        this._changed = false;
        this._loaded = true;

        this.emit(StorageEvent.LOAD, new StorageEvent(StorageEvent.LOAD));
    }

    public addSprite(pixels: Buffer | ByteArray): ChangeResult {
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }

        const result = this.internalAddSprite(pixels);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public addSprites(sprites: (Buffer | ByteArray)[]): ChangeResult {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }

        const result = this.internalAddSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public replaceSprite(id: number, pixels: Buffer | ByteArray): ChangeResult {
        if (id === 0 || id > this._spritesCount) {
            throw new Error(Resources.getString("indexOutOfRange"));
        }

        if (!pixels) {
            throw new Error("pixels cannot be null");
        }

        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        if (pixelBuffer.length !== SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error("Parameter pixels has an invalid length.");
        }

        const result = this.internalReplaceSprite(id, pixels);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public replaceSprites(sprites: SpriteData[]): ChangeResult {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }

        const result = this.internalReplaceSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public removeSprite(id: number): ChangeResult {
        if (id === 0 || id > this._spritesCount) {
            throw new Error(Resources.getString("indexOutOfRange"));
        }

        const result = this.internalRemoveSprite(id);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public removeSprites(sprites: number[]): ChangeResult {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }

        const result = this.internalRemoveSprites(sprites);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public getSprite(id: number): Sprite | null {
        if (id === 0xFFFFFFFF) return this._alertSprite;

        if (this._loaded && id <= this._spritesCount) {
            let sprite: Sprite | null = null;
            if (this._sprites.has(id)) {
                sprite = this._sprites.get(id)!;
            } else {
                sprite = this.readSprite(id);
            }

            if (!sprite) {
                sprite = this._blankSprite;
            }

            return sprite;
        }
        return null;
    }

    public getPixels(id: number): Buffer | null {
        if (this._loaded) {
            const sprite = this.getSprite(id);
            if (sprite) {
                try {
                    const pixels = sprite.getPixels();
                    return pixels instanceof Buffer ? pixels : pixels.toBuffer();
                } catch (error) {
                    // Log.error(Resources.getString("failedToGetSprite", id));
                    const alertPixels = this._alertSprite?.getPixels();
                    return alertPixels ? (alertPixels instanceof Buffer ? alertPixels : alertPixels.toBuffer()) : null;
                }
            }
        }
        return null;
    }

    public copyPixels(id: number, bitmap: BitmapData, x: number, y: number): void {
        if (!this.loaded || !bitmap) return;

        try {
            const sprite = this.getBitmap(id, true);
            if (!sprite) return;

            bitmap.copyPixels(sprite, this._rect, { x, y }, null, null, true);
        } catch (error) {
            const alertBitmap = SpriteUtils.createAlertBitmap();
            bitmap.copyPixels(alertBitmap, this._rect, { x, y }, null, null, true);
            // Log.error(Resources.getString("failedToGetSprite", id));
        }
    }

    public getBitmap(id: number, transparent: boolean): BitmapData | null {
        if (!this.loaded || id === 0) {
            return null;
        }

        const sprite = this.getSprite(id);
        if (!sprite) {
            return null;
        }

        let bitmap = sprite.getBitmap();
        if (!transparent && bitmap) {
            bitmap = SpriteUtils.fillBackground(bitmap);
        }

        return bitmap;
    }

    public hasSpriteId(id: number): boolean {
        if (this._loaded && id <= this._spritesCount) {
            return true;
        }
        return false;
    }

    public compare(id: number, pixels: Buffer | ByteArray): boolean {
        if (!pixels) {
            throw new Error("pixels cannot be null");
        }

        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        if (pixelBuffer.length !== SpriteExtent.DEFAULT_DATA_SIZE) {
            throw new Error("Parameter pixels has an invalid length.");
        }

        if (this.hasSpriteId(id)) {
            const bmp1 = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
            bmp1.setPixels(bmp1.rect, pixelBuffer);
            const otherPixels = this.getPixels(id);
            if (otherPixels) {
                const bmp2 = new BitmapData(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE, true, 0xFFFF00FF);
                bmp2.setPixels(bmp2.rect, otherPixels);
                // TODO: Implement bitmap comparison
                return true; // Placeholder
            }
        }
        return false;
    }

    public compile(filePath: string, version: Version, extended: boolean, transparency: boolean): boolean {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (!version) {
            throw new Error("version cannot be null");
        }

        if (!this._loaded) {
            return false;
        }

        extended = (extended || version.value >= 960);
        const equal = (this._file === filePath);

        // If is unmodified and the version is equal only save raw bytes.
        if (!this.isTemporary &&
            !this._changed &&
            this._version &&
            this._version.equals(version) &&
            this._extended === extended &&
            this._transparency === transparency) {
            if (!equal && this._file) {
                fs.copyFileSync(this._file, filePath);
            }

            this.emit(ProgressEvent.PROGRESS, new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.SPRITES, this._spritesCount, this._spritesCount));
            return true;
        }

        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const tmpFilePath = path.join(dir, "tmp_" + fileName);
        let done = false;
        let headSize: number;
        let count: number;

        try {
            // Build sprite data first
            const spriteData: Array<{ address: number; data: Buffer | null }> = [];
            const dispatchProgress = this.listenerCount(ProgressEvent.PROGRESS) > 0;

            // Calculate sprite count
            if (extended || version.value >= 960) {
                count = this._spritesCount;
                headSize = SpriteFileSize.HEADER_U32;
            } else {
                count = this._spritesCount >= 0xFFFF ? 0xFFFE : this._spritesCount;
                headSize = SpriteFileSize.HEADER_U16;
            }

            // Collect sprite data
            for (let i = 1; i <= count; i++) {
                const sprite = this.getSprite(i);
                if (!sprite || sprite.isEmpty) {
                    spriteData.push({ address: 0, data: null });
                } else {
                    sprite.transparent = transparency;
                    sprite.compressedPixels.position = 0;

                    // Build sprite data buffer
                    const spriteBuffer = Buffer.alloc(5 + sprite.length); // 3 color bytes + 2 size bytes + data
                    spriteBuffer.writeUInt8(0xFF, 0);  // red
                    spriteBuffer.writeUInt8(0x00, 1);  // blue
                    spriteBuffer.writeUInt8(0xFF, 2);  // green
                    spriteBuffer.writeUInt16LE(sprite.length, 3); // size
                    if (sprite.length > 0) {
                        sprite.compressedPixels.toBuffer().copy(spriteBuffer, 5);
                    }
                    spriteData.push({ address: 0, data: spriteBuffer });
                }

                if (dispatchProgress && (i % 10) === 0) {
                    this.emit(ProgressEvent.PROGRESS, new ProgressEvent(
                        ProgressEvent.PROGRESS,
                        ProgressBarID.SPRITES,
                        i,
                        count));
                }
            }

            // Calculate addresses
            let offset = headSize + (count * SpriteFileSize.ADDRESS);
            for (let i = 0; i < spriteData.length; i++) {
                if (spriteData[i].data) {
                    spriteData[i].address = offset;
                    offset += spriteData[i].data!.length;
                }
            }

            // Build final buffer
            const headerBuffer = Buffer.alloc(headSize);
            headerBuffer.writeUInt32LE(version.sprSignature, 0);
            if (extended || version.value >= 960) {
                headerBuffer.writeUInt32LE(count, 4);
            } else {
                headerBuffer.writeUInt16LE(count, 4);
            }

            const addressTableBuffer = Buffer.alloc(count * SpriteFileSize.ADDRESS);
            for (let i = 0; i < count; i++) {
                addressTableBuffer.writeUInt32LE(spriteData[i].address, i * SpriteFileSize.ADDRESS);
            }

            // Combine all buffers
            const spriteBuffers: Buffer[] = [headerBuffer, addressTableBuffer];
            for (const sprite of spriteData) {
                if (sprite.data) {
                    spriteBuffers.push(sprite.data);
                }
            }

            const finalBuffer = Buffer.concat(spriteBuffers);

            // Write to temporary file
            fs.writeFileSync(tmpFilePath, finalBuffer);
            done = true;
        } catch (error: any) {
            this.emit("error", new Error(error.message || error));
            done = false;
        }

        if (done) {
            // Delete old file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Rename temporary file
            fs.renameSync(tmpFilePath, filePath);
            this._file = filePath;

            // Reload if equal
            if (equal) {
                this.onLoad(filePath, version, extended, transparency, true);
            }

            this._changed = false;
        } else if (fs.existsSync(tmpFilePath)) {
            fs.unlinkSync(tmpFilePath);
        }

        this.emit(StorageEvent.COMPILE, new StorageEvent(StorageEvent.COMPILE));
        this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));

        return done;
    }

    public isEmptySprite(id: number): boolean {
        if (this._loaded && id <= this._spritesCount) {
            if (this._sprites.has(id)) {
                return this._sprites.get(id)!.isEmpty;
            } else if (this._reader) {
                return this._reader.isEmptySprite(id);
            }
        }
        return true;
    }

    public invalidate(): void {
        if (!this._changed) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
    }

    public unload(): void {
        this._reader = null;
        this._file = null;
        this._version = null;
        this._sprites.clear();
        this._spritesCount = 0;
        this._signature = 0;
        this._extended = false;
        this._transparency = false;
        this._blankSprite = null;
        this._alertSprite = null;
        this._headerSize = 0;
        this._changed = false;
        this._loaded = false;

        this.emit(StorageEvent.UNLOAD, new StorageEvent(StorageEvent.UNLOAD));
        this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
    }

    // Private methods
    private onLoad(filePath: string, version: Version, extended: boolean, transparency: boolean, reloading: boolean): void {
        if (!fs.existsSync(filePath)) {
            // Log.error(Resources.getString("fileNotFound", filePath));
            return;
        }

        this._file = filePath;
        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._transparency = transparency;
        this._reader = SpriteReader.fromFile(filePath, this._extended, transparency);
        this._signature = this._reader.readSignature();
        this._spritesCount = this._reader.readSpriteCount();
        this._headerSize = this._extended ? SpriteFileSize.HEADER_U32 : SpriteFileSize.HEADER_U16;
        this._blankSprite = new Sprite(0, transparency);
        this._alertSprite = this.createAlertSprite(transparency);
        this._sprites = new Map();
        this._sprites.set(0, this._blankSprite);
        this._changed = false;
        this._loaded = true;

        if (!reloading) {
            this.emit(ProgressEvent.PROGRESS, new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.SPRITES, this._spritesCount, this._spritesCount));
            this.emit(StorageEvent.LOAD, new StorageEvent(StorageEvent.LOAD));
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
    }

    private createAlertSprite(transparency: boolean): Sprite {
        // TODO: Create alert sprite from assets
        return new Sprite(0xFFFFFFFF, transparency);
    }

    private readSprite(id: number): Sprite | null {
        try {
            if (this._reader) {
                return this._reader.readSprite(id);
            }
            return this._alertSprite;
        } catch (error) {
            // Log.error(Resources.getString("failedToGetSprite", id));
            return this._alertSprite;
        }
    }

    private internalAddSprite(pixels: Buffer | ByteArray): ChangeResult {
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        this._spritesCount++;
        const sprite = new Sprite(this._spritesCount, this._transparency);
        sprite.setPixels(ByteArray.fromBuffer(pixelBuffer));
        this._sprites.set(this._spritesCount, sprite);
        return new ChangeResult([sprite], true);
    }

    private internalAddSprites(sprites: (Buffer | ByteArray)[]): ChangeResult {
        const added: Sprite[] = [];
        for (const pixels of sprites) {
            const result = this.internalAddSprite(pixels);
            if (result.list) {
                added.push(...(result.list as Sprite[]));
            }
        }
        return new ChangeResult(added, true);
    }

    private internalReplaceSprite(id: number, pixels: Buffer | ByteArray): ChangeResult {
        const pixelBuffer = pixels instanceof Buffer ? pixels : (pixels instanceof ByteArray ? pixels.toBuffer() : Buffer.alloc(0));
        const oldSprite = this._sprites.get(id);
        const sprite = new Sprite(id, this._transparency);
        sprite.setPixels(ByteArray.fromBuffer(pixelBuffer));
        this._sprites.set(id, sprite);
        return new ChangeResult([oldSprite], true);
    }

    private internalReplaceSprites(sprites: SpriteData[]): ChangeResult {
        const replaced: Sprite[] = [];
        for (const spriteData of sprites) {
            const oldSprite = this._sprites.get(spriteData.id);
            const sprite = new Sprite(spriteData.id, this._transparency);
            if (spriteData.pixels) {
                sprite.setPixels(ByteArray.fromBuffer(spriteData.pixels));
            }
            this._sprites.set(spriteData.id, sprite);
            if (oldSprite) {
                replaced.push(oldSprite);
            }
        }
        return new ChangeResult(replaced, true);
    }

    private internalRemoveSprite(id: number): ChangeResult {
        const sprite = this._sprites.get(id);
        if (sprite) {
            this._sprites.delete(id);
            return new ChangeResult([sprite], true);
        }
        return new ChangeResult(null, false, "Sprite not found");
    }

    private internalRemoveSprites(sprites: number[]): ChangeResult {
        const removed: Sprite[] = [];
        sprites.sort((a, b) => b - a); // Sort descending

        for (const id of sprites) {
            if (this._sprites.has(id)) {
                const sprite = this._sprites.get(id)!;
                this._sprites.delete(id);
                removed.push(sprite);
            }
        }

        return new ChangeResult(removed, true);
    }
}


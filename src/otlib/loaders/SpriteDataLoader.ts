/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import { PathHelper } from "./PathHelper";
import { SpriteData } from "../sprites/SpriteData";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { SpriteUtils } from "../utils/SpriteUtils";
import { SpriteExtent } from "../utils/SpriteExtent";
import { Resources } from "../resources/Resources";
import { BitmapData } from "../utils/BitmapData";
import { SpriteReader } from "../sprites/SpriteReader";
import { Version } from "../core/Version";
import sharp from "sharp";

export class SpriteDataLoader extends EventEmitter {
    private _spriteDataList: SpriteData[] = [];
    private _files: PathHelper[] = [];
    private _index: number = -1;
    private _cancel: boolean = false;
    private _version: Version | null = null;
    private _extended: boolean = false;
    private _transparency: boolean = false;

    public get spriteDataList(): SpriteData[] { return this._spriteDataList; }
    public get length(): number { return this._files ? this._files.length : 0; }

    public setVersion(version: Version | null): void {
        this._version = version;
        if (version) {
            this._extended = version.value >= 960;
        }
    }

    public setExtended(extended: boolean): void {
        this._extended = extended;
    }

    public setTransparency(transparency: boolean): void {
        this._transparency = transparency;
    }

    constructor() {
        super();
    }

    public load(file: PathHelper): void {
        if (!file) {
            throw new Error("file cannot be null");
        }
        this.onLoad([file]);
    }

    public loadFiles(files: PathHelper[]): void {
        if (!files) {
            throw new Error("files cannot be null");
        }

        if (files.length > 0) {
            this.onLoad(files);
        }
    }

    private onLoad(files: PathHelper[]): void {
        this._files = files;
        this._spriteDataList = [];
        this._index = -1;
        this.loadNext();
    }

    private async loadNext(): Promise<void> {
        if (this._cancel) {
            this._spriteDataList = [];
            this._files = [];
            this._index = -1;
            return;
        }

        this._index++;

        this.emit(ProgressEvent.PROGRESS, new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, this._index, this._files.length));

        if (this._index >= this._files.length) {
            this.emit("complete");
            return;
        }

        const filePath = this._files[this._index].nativePath;
        const ext = path.extname(filePath).toLowerCase().substring(1);

        // Check if it's an SPR file
        if (ext === "spr") {
            await this.loadSprFile(filePath);
        } else if (["png", "bmp", "jpg", "jpeg", "gif"].includes(ext)) {
            // Check if it's an image format
            await this.loadImage(filePath, this._files[this._index].id);
        } else {
            // Unknown format, skip
            this.loadNext();
        }
    }

    private async loadImage(filePath: string, id: number): Promise<void> {
        try {
            // Use sharp to load and process image
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            if (metadata.width !== SpriteExtent.DEFAULT_SIZE || metadata.height !== SpriteExtent.DEFAULT_SIZE) {
                this._cancel = true;
                this.emit("error", new Error(Resources.getString("invalidSpriteSize", SpriteExtent.DEFAULT_VALUE)));
                return;
            }

            // Resize if needed and get raw pixel data
            const { data, info } = await image
                .resize(SpriteExtent.DEFAULT_SIZE, SpriteExtent.DEFAULT_SIZE)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Create bitmap from raw data
            const bitmap = new BitmapData(info.width, info.height, true);
            bitmap.setPixels(bitmap.rect, data);

            // Remove magenta and create sprite data
            const processedBitmap = SpriteUtils.removeMagenta(bitmap);
            const spriteData = new SpriteData();
            spriteData.id = id;
            spriteData.pixels = processedBitmap.getPixels(processedBitmap.rect);

            this._spriteDataList.push(spriteData);
            this.loadNext();
        } catch (error: any) {
            this._spriteDataList = [];
            this.emit("error", new Error(error.message || error));
        }
    }

    private async loadSprFile(filePath: string): Promise<void> {
        try {
            // Determine extended and transparency from version or use defaults
            const extended = this._extended || (this._version ? this._version.value >= 960 : false);
            const transparency = this._transparency;

            // Read SPR file using SpriteReader
            const reader = SpriteReader.fromFile(filePath, extended, transparency);
            
            // Read sprite count
            const spriteCount = reader.readSpriteCount();
            
            // Read all sprites from the SPR file
            for (let spriteId = 1; spriteId <= spriteCount; spriteId++) {
                if (this._cancel) {
                    this._spriteDataList = [];
                    this._files = [];
                    this._index = -1;
                    return;
                }

                const sprite = reader.readSprite(spriteId);
                if (sprite && !sprite.isEmpty) {
                    // Get pixels from sprite
                    const pixels = sprite.getPixels();
                    if (pixels && pixels.length > 0) {
                        const spriteData = new SpriteData();
                        spriteData.id = spriteId;
                        spriteData.pixels = pixels.toBuffer();
                        this._spriteDataList.push(spriteData);
                    }
                }

                // Emit progress for each sprite
                this.emit(ProgressEvent.PROGRESS, new ProgressEvent(
                    ProgressEvent.PROGRESS,
                    ProgressBarID.DEFAULT,
                    spriteId,
                    spriteCount
                ));
            }

            this.loadNext();
        } catch (error: any) {
            this._spriteDataList = [];
            this.emit("error", new Error(`Failed to load SPR file: ${error.message || error}`));
        }
    }
}


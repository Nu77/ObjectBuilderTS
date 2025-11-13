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
import sharp from "sharp";

export class SpriteDataLoader extends EventEmitter {
    private _spriteDataList: SpriteData[] = [];
    private _files: PathHelper[] = [];
    private _index: number = -1;
    private _cancel: boolean = false;

    public get spriteDataList(): SpriteData[] { return this._spriteDataList; }
    public get length(): number { return this._files ? this._files.length : 0; }

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

        // Check if it's an image format
        const imageFormats = ["png", "bmp", "jpg", "jpeg", "gif"];
        if (imageFormats.includes(ext)) {
            await this.loadImage(filePath, this._files[this._index].id);
        } else {
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
}


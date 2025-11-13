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
import { EventEmitter } from "events";
import { SpriteDimension } from "./SpriteDimension";
import { ISpriteDimensionStorage } from "./ISpriteDimensionStorage";
import { ClientInfo } from "../utils/ClientInfo";

export class SpriteDimensionStorage extends EventEmitter implements ISpriteDimensionStorage {
    private static _instance: ISpriteDimensionStorage | null = null;

    private _file: string | null = null;
    private _dimensions: Map<string, SpriteDimension> = new Map();
    private _changed: boolean = false;
    private _loaded: boolean = false;

    public get file(): string | null { return this._file; }
    public get changed(): boolean { return this._changed; }
    public get loaded(): boolean { return this._loaded; }

    constructor() {
        super();
        if (SpriteDimensionStorage._instance) {
            throw new Error("SpriteDimensionStorage is a singleton class");
        }
        SpriteDimensionStorage._instance = this;
    }

    public static getInstance(): ISpriteDimensionStorage {
        if (!SpriteDimensionStorage._instance) {
            SpriteDimensionStorage._instance = new SpriteDimensionStorage();
        }
        return SpriteDimensionStorage._instance;
    }

    public load(filePath: string): boolean {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        if (this.loaded) {
            this.unload();
        }

        try {
            const xmlContent = fs.readFileSync(filePath, "utf-8");
            
            // Use synchronous XML parsing
            const xml2js = require("xml2js");
            const parser = new xml2js.Parser();
            const result = parser.parseStringSync(xmlContent);

            if (result.sprites === undefined || !result.sprites.sprite) {
                throw new Error("Invalid sprites XML structure.");
            }

            const sprites = Array.isArray(result.sprites.sprite) 
                ? result.sprites.sprite 
                : [result.sprites.sprite];

            for (const spriteXML of sprites) {
                const dimension = new SpriteDimension();
                dimension.unserialize(spriteXML.$);
                this._dimensions.set(dimension.value, dimension);
            }

            this._file = filePath;
            this._changed = false;
            this._loaded = true;
            this.emit("complete");

            return this._loaded;
        } catch (error: any) {
            throw new Error(`Failed to load sprite dimensions: ${error.message || error}`);
        }
    }

    public getList(): SpriteDimension[] {
        const list: SpriteDimension[] = [];
        for (const dimension of this._dimensions.values()) {
            list.push(dimension);
        }
        return list;
    }

    public getBySizes(size: number, dataSize: number): SpriteDimension | null {
        for (const dimension of this._dimensions.values()) {
            if (dimension.size === size && dimension.dataSize === dataSize) {
                return dimension;
            }
        }
        return null;
    }

    public getFromClientInfo(info: ClientInfo): SpriteDimension | null {
        return this.getBySizes(info.spriteSize, info.spriteDataSize);
    }

    public unload(): void {
        this._file = null;
        this._dimensions.clear();
        this._changed = false;
        this._loaded = false;
    }
}


"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteDimensionStorage = void 0;
const fs = __importStar(require("fs"));
const events_1 = require("events");
const SpriteDimension_1 = require("./SpriteDimension");
class SpriteDimensionStorage extends events_1.EventEmitter {
    get file() { return this._file; }
    get changed() { return this._changed; }
    get loaded() { return this._loaded; }
    constructor() {
        super();
        this._file = null;
        this._dimensions = new Map();
        this._changed = false;
        this._loaded = false;
        if (SpriteDimensionStorage._instance) {
            throw new Error("SpriteDimensionStorage is a singleton class");
        }
        SpriteDimensionStorage._instance = this;
    }
    static getInstance() {
        if (!SpriteDimensionStorage._instance) {
            SpriteDimensionStorage._instance = new SpriteDimensionStorage();
        }
        return SpriteDimensionStorage._instance;
    }
    load(filePath) {
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
                const dimension = new SpriteDimension_1.SpriteDimension();
                dimension.unserialize(spriteXML.$);
                this._dimensions.set(dimension.value, dimension);
            }
            this._file = filePath;
            this._changed = false;
            this._loaded = true;
            this.emit("complete");
            return this._loaded;
        }
        catch (error) {
            throw new Error(`Failed to load sprite dimensions: ${error.message || error}`);
        }
    }
    getList() {
        const list = [];
        for (const dimension of this._dimensions.values()) {
            list.push(dimension);
        }
        return list;
    }
    getBySizes(size, dataSize) {
        for (const dimension of this._dimensions.values()) {
            if (dimension.size === size && dimension.dataSize === dataSize) {
                return dimension;
            }
        }
        return null;
    }
    getFromClientInfo(info) {
        return this.getBySizes(info.spriteSize, info.spriteDataSize);
    }
    unload() {
        this._file = null;
        this._dimensions.clear();
        this._changed = false;
        this._loaded = false;
    }
}
exports.SpriteDimensionStorage = SpriteDimensionStorage;
SpriteDimensionStorage._instance = null;

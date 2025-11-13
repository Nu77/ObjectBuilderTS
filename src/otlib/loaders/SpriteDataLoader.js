"use strict";

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteDataLoader = void 0;
const path = __importStar(require("path"));
const events_1 = require("events");
const SpriteData_1 = require("../sprites/SpriteData");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const SpriteUtils_1 = require("../utils/SpriteUtils");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const Resources_1 = require("../resources/Resources");
const BitmapData_1 = require("../utils/BitmapData");
const sharp_1 = __importDefault(require("sharp"));
class SpriteDataLoader extends events_1.EventEmitter {
    get spriteDataList() { return this._spriteDataList; }
    get length() { return this._files ? this._files.length : 0; }
    constructor() {
        super();
        this._spriteDataList = [];
        this._files = [];
        this._index = -1;
        this._cancel = false;
    }
    load(file) {
        if (!file) {
            throw new Error("file cannot be null");
        }
        this.onLoad([file]);
    }
    loadFiles(files) {
        if (!files) {
            throw new Error("files cannot be null");
        }
        if (files.length > 0) {
            this.onLoad(files);
        }
    }
    onLoad(files) {
        this._files = files;
        this._spriteDataList = [];
        this._index = -1;
        this.loadNext();
    }
    async loadNext() {
        if (this._cancel) {
            this._spriteDataList = [];
            this._files = [];
            this._index = -1;
            return;
        }
        this._index++;
        this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, this._index, this._files.length));
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
        }
        else {
            this.loadNext();
        }
    }
    async loadImage(filePath, id) {
        try {
            // Use sharp to load and process image
            const image = (0, sharp_1.default)(filePath);
            const metadata = await image.metadata();
            if (metadata.width !== SpriteExtent_1.SpriteExtent.DEFAULT_SIZE || metadata.height !== SpriteExtent_1.SpriteExtent.DEFAULT_SIZE) {
                this._cancel = true;
                this.emit("error", new Error(Resources_1.Resources.getString("invalidSpriteSize", SpriteExtent_1.SpriteExtent.DEFAULT_VALUE)));
                return;
            }
            // Resize if needed and get raw pixel data
            const { data, info } = await image
                .resize(SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_SIZE)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            // Create bitmap from raw data
            const bitmap = new BitmapData_1.BitmapData(info.width, info.height, true);
            bitmap.setPixels(bitmap.rect, data);
            // Remove magenta and create sprite data
            const processedBitmap = SpriteUtils_1.SpriteUtils.removeMagenta(bitmap);
            const spriteData = new SpriteData_1.SpriteData();
            spriteData.id = id;
            spriteData.pixels = processedBitmap.getPixels(processedBitmap.rect);
            this._spriteDataList.push(spriteData);
            this.loadNext();
        }
        catch (error) {
            this._spriteDataList = [];
            this.emit("error", new Error(error.message || error));
        }
    }
}
exports.SpriteDataLoader = SpriteDataLoader;

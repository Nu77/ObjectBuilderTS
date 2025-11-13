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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMerger = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const ThingTypeStorage_1 = require("../things/ThingTypeStorage");
const SpriteStorage_1 = require("../sprites/SpriteStorage");
const FrameGroupType_1 = require("../things/FrameGroupType");
const ThingUtils_1 = require("./ThingUtils");
const SpritesOptimizer_1 = require("./SpritesOptimizer");
const StorageQueueLoader_1 = require("../storages/StorageQueueLoader");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
class ClientMerger extends events_1.EventEmitter {
    get itemsCount() { return this._itemsCount; }
    get outfitsCount() { return this._outfitsCount; }
    get effectsCount() { return this._effectsCount; }
    get missilesCount() { return this._missilesCount; }
    get spritesCount() { return this._spritesCount; }
    constructor(objects, sprites, settings) {
        super();
        this._objects = null;
        this._sprites = null;
        this._spriteIds = new Map();
        this._itemsCount = 0;
        this._outfitsCount = 0;
        this._effectsCount = 0;
        this._missilesCount = 0;
        this._spritesCount = 0;
        if (!objects) {
            throw new Error("objects cannot be null");
        }
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        if (!settings) {
            throw new Error("settings cannot be null");
        }
        this._currentObjects = objects;
        this._currentSprites = sprites;
        this._settings = settings;
    }
    start(datFile, sprFile, version, extended, improvedAnimations, frameGroups, transparency, optimizeSprites = true) {
        if (!datFile) {
            throw new Error("datFile cannot be null");
        }
        if (!fs.existsSync(datFile)) {
            throw new Error(`File not found: ${datFile}`);
        }
        if (!sprFile) {
            throw new Error("sprFile cannot be null");
        }
        if (!fs.existsSync(sprFile)) {
            throw new Error(`File not found: ${sprFile}`);
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        this._objects = new ThingTypeStorage_1.ThingTypeStorage(this._settings);
        this._objects.on("error", this.errorHandler.bind(this));
        this._sprites = new SpriteStorage_1.SpriteStorage();
        this._sprites.on("error", this.errorHandler.bind(this));
        const loader = new StorageQueueLoader_1.StorageQueueLoader();
        loader.on("complete", () => {
            loader.removeAllListeners("complete");
            if (optimizeSprites) {
                this.startOptimizeSprites();
            }
            else {
                this.startMerge();
            }
        });
        loader.add(this._objects, this._objects.load, datFile, version, extended, improvedAnimations, frameGroups);
        loader.add(this._sprites, this._sprites.load, sprFile, version, extended, transparency);
        loader.start();
    }
    startOptimizeSprites() {
        if (!this._objects || !this._sprites) {
            return;
        }
        const optimizer = new SpritesOptimizer_1.SpritesOptimizer(this._objects, this._sprites);
        optimizer.on("progress", (event) => {
            this.emit("progress", event);
        });
        optimizer.on("complete", () => {
            this.startMerge();
        });
        optimizer.start();
    }
    startMerge() {
        if (!this._objects || !this._sprites) {
            return;
        }
        const oldItemsCount = this._currentObjects.itemsCount;
        const oldOutfitsCount = this._currentObjects.outfitsCount;
        const oldEffectsCount = this._currentObjects.effectsCount;
        const oldMissilesCount = this._currentObjects.missilesCount;
        const oldSpritesCount = this._currentSprites.spritesCount;
        this.mergeSpriteList(1, this._sprites.spritesCount);
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, 1, 5));
        this.mergeObjectList(this._objects.items, 100, this._objects.itemsCount);
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, 2, 5));
        this.mergeObjectList(this._objects.outfits, 1, this._objects.outfitsCount);
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, 3, 5));
        this.mergeObjectList(this._objects.effects, 1, this._objects.effectsCount);
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, 4, 5));
        this.mergeObjectList(this._objects.missiles, 1, this._objects.missilesCount);
        this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, 5, 5));
        this._currentObjects.invalidate();
        this._currentSprites.invalidate();
        this._itemsCount = this._currentObjects.itemsCount - oldItemsCount;
        this._outfitsCount = this._currentObjects.outfitsCount - oldOutfitsCount;
        this._effectsCount = this._currentObjects.effectsCount - oldEffectsCount;
        this._missilesCount = this._currentObjects.missilesCount - oldMissilesCount;
        this._spritesCount = this._currentSprites.spritesCount - oldSpritesCount;
        this.emit("complete");
    }
    mergeSpriteList(min, max) {
        if (!this._sprites) {
            return;
        }
        this._spriteIds = new Map();
        for (let id = min; id <= max; id++) {
            if (this._sprites.isEmptySprite(id)) {
                this._spriteIds.set(id, 0);
            }
            else {
                const pixels = this._sprites.getPixels(id);
                if (pixels) {
                    const result = this._currentSprites.addSprite(pixels);
                    if (result.done) {
                        this._spriteIds.set(id, this._currentSprites.spritesCount);
                    }
                }
            }
        }
    }
    mergeObjectList(list, min, max) {
        const objects = [];
        for (let id = min; id <= max; id++) {
            const type = list.get(id);
            if (!type) {
                continue;
            }
            if (ThingUtils_1.ThingUtils.isEmpty(type)) {
                continue;
            }
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
                const frameGroup = type.getFrameGroup(groupType);
                if (!frameGroup) {
                    continue;
                }
                const spriteIds = frameGroup.spriteIndex;
                if (!spriteIds) {
                    continue;
                }
                for (let k = spriteIds.length - 1; k >= 0; k--) {
                    const sid = spriteIds[k];
                    if (sid !== 0) {
                        const newId = this._spriteIds.get(sid);
                        if (newId !== undefined) {
                            spriteIds[k] = newId;
                        }
                        else {
                            spriteIds[k] = 0;
                        }
                    }
                }
            }
            objects.push(type);
        }
        if (objects.length !== 0) {
            this._currentObjects.addThings(objects);
        }
    }
    errorHandler(error) {
        console.error("ClientMerger error:", error);
    }
}
exports.ClientMerger = ClientMerger;

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
exports.ThingTypeStorage = void 0;
const fs = __importStar(require("fs"));
const events_1 = require("events");
const ThingType_1 = require("./ThingType");
const ThingCategory_1 = require("./ThingCategory");
const StorageEvent_1 = require("../storages/events/StorageEvent");
const ChangeResult_1 = require("../utils/ChangeResult");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const Resources_1 = require("../resources/Resources");
const ThingUtils_1 = require("../utils/ThingUtils");
const MetadataReader1_1 = require("./MetadataReader1");
const MetadataReader2_1 = require("./MetadataReader2");
const MetadataReader3_1 = require("./MetadataReader3");
const MetadataReader4_1 = require("./MetadataReader4");
const MetadataReader5_1 = require("./MetadataReader5");
const MetadataReader6_1 = require("./MetadataReader6");
const MetadataWriter1_1 = require("./MetadataWriter1");
const MetadataWriter2_1 = require("./MetadataWriter2");
const MetadataWriter3_1 = require("./MetadataWriter3");
const MetadataWriter4_1 = require("./MetadataWriter4");
const MetadataWriter5_1 = require("./MetadataWriter5");
const MetadataWriter6_1 = require("./MetadataWriter6");
const MetadataFlags1_1 = require("./MetadataFlags1");
const ByteArray_1 = require("../utils/ByteArray");
const path = __importStar(require("path"));
class ThingTypeStorage extends events_1.EventEmitter {
    get file() { return this._file; }
    get version() { return this._version; }
    get signature() { return this._signature; }
    get items() { return this._items; }
    get outfits() { return this._outfits; }
    get effects() { return this._effects; }
    get missiles() { return this._missiles; }
    get itemsCount() { return this._itemsCount; }
    get outfitsCount() { return this._outfitsCount; }
    get effectsCount() { return this._effectsCount; }
    get missilesCount() { return this._missilesCount; }
    get changed() { return this._changed; }
    get isTemporary() { return (this._loaded && this._file === null); }
    get loaded() { return this._loaded; }
    constructor(settings) {
        super();
        this._file = null;
        this._version = null;
        this._signature = 0;
        this._items = new Map();
        this._itemsCount = ThingTypeStorage.MIN_ITEM_ID;
        this._outfits = new Map();
        this._outfitsCount = ThingTypeStorage.MIN_OUTFIT_ID;
        this._effects = new Map();
        this._effectsCount = ThingTypeStorage.MIN_EFFECT_ID;
        this._missiles = new Map();
        this._missilesCount = ThingTypeStorage.MIN_MISSILE_ID;
        this._thingsCount = 0;
        this._extended = false;
        this._improvedAnimations = false;
        this._frameGroups = false;
        this._progressCount = 0;
        this._changed = false;
        this._loaded = false;
        this._settings = settings;
    }
    load(filePath, version, extended = false, improvedAnimations = false, frameGroups = false) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (this.loaded)
            return;
        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._improvedAnimations = (improvedAnimations || version.value >= 1050);
        this._frameGroups = (frameGroups || version.value >= 1057);
        try {
            // Read file into ByteArray
            const fileBuffer = fs.readFileSync(filePath);
            const bytes = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
            // Create version-specific reader
            let reader;
            if (version.value <= 730) {
                reader = new MetadataReader1_1.MetadataReader1(bytes);
            }
            else if (version.value <= 750) {
                reader = new MetadataReader2_1.MetadataReader2(bytes);
            }
            else if (version.value <= 772) {
                reader = new MetadataReader3_1.MetadataReader3(bytes);
            }
            else if (version.value <= 854) {
                reader = new MetadataReader4_1.MetadataReader4(bytes);
            }
            else if (version.value <= 986) {
                reader = new MetadataReader5_1.MetadataReader5(bytes);
            }
            else {
                reader = new MetadataReader6_1.MetadataReader6(bytes);
            }
            reader.setSettings(this._settings);
            this.readBytes(reader);
        }
        catch (error) {
            this.emit("error", new Error(error.message || error));
            return;
        }
        this._file = filePath;
        this._changed = false;
        this._loaded = true;
        this.emit(StorageEvent_1.StorageEvent.LOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.LOAD));
        this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
    }
    createNew(version, extended, improvedAnimations, frameGroups) {
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (this.loaded)
            return;
        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._improvedAnimations = (improvedAnimations || version.value >= 1050);
        this._frameGroups = (frameGroups || version.value >= 1057);
        this._signature = version.datSignature;
        this._items = new Map();
        this._outfits = new Map();
        this._effects = new Map();
        this._missiles = new Map();
        this._itemsCount = ThingTypeStorage.MIN_ITEM_ID;
        this._outfitsCount = ThingTypeStorage.MIN_OUTFIT_ID;
        this._effectsCount = ThingTypeStorage.MIN_EFFECT_ID;
        this._missilesCount = ThingTypeStorage.MIN_MISSILE_ID;
        // Create initial things
        this._items.set(this._itemsCount, ThingType_1.ThingType.create(this._itemsCount, ThingCategory_1.ThingCategory.ITEM, this._frameGroups, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.ITEM)));
        this._outfits.set(this._outfitsCount, ThingType_1.ThingType.create(this._outfitsCount, ThingCategory_1.ThingCategory.OUTFIT, this._frameGroups, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.OUTFIT)));
        this._effects.set(this._effectsCount, ThingType_1.ThingType.create(this._effectsCount, ThingCategory_1.ThingCategory.EFFECT, this._frameGroups, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.EFFECT)));
        this._missiles.set(this._missilesCount, ThingType_1.ThingType.create(this._missilesCount, ThingCategory_1.ThingCategory.MISSILE, this._frameGroups, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.MISSILE)));
        this._changed = false;
        this._loaded = true;
        this.emit(StorageEvent_1.StorageEvent.LOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.LOAD));
    }
    addThing(thing, category) {
        if (!thing) {
            throw new Error("thing cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        const result = this.internalAddThing(thing, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    addThings(things) {
        if (!things) {
            throw new Error("things cannot be null");
        }
        const result = this.internalAddThings(things);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    replaceThing(thing, category, replaceId) {
        if (!thing) {
            throw new Error("thing cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this.hasThingType(category, replaceId)) {
            throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(category), replaceId));
        }
        const result = this.internalReplaceThing(thing, category, replaceId);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    replaceThings(things) {
        if (!things) {
            throw new Error("things cannot be null");
        }
        const result = this.internalReplaceThings(things);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    removeThing(id, category) {
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this.hasThingType(category, id)) {
            throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(category), id));
        }
        const result = this.internalRemoveThing(id, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    removeThings(things, category) {
        if (!things) {
            throw new Error("things cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        const result = this.internalRemoveThings(things, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        }
        return result;
    }
    compile(filePath, version, extended, frameDurations, frameGroups) {
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
        frameDurations = (frameDurations || version.value >= 1050);
        frameGroups = (frameGroups || version.value >= 1057);
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const tmpFilePath = path.join(dir, "tmp_" + fileName);
        let done = true;
        try {
            this._thingsCount = this._itemsCount + this._outfitsCount + this._effectsCount + this._missilesCount;
            this._progressCount = 0;
            // Create version-specific writer
            let writer;
            if (version.value <= 730) {
                writer = new MetadataWriter1_1.MetadataWriter1();
            }
            else if (version.value <= 750) {
                writer = new MetadataWriter2_1.MetadataWriter2();
            }
            else if (version.value <= 772) {
                writer = new MetadataWriter3_1.MetadataWriter3();
            }
            else if (version.value <= 854) {
                writer = new MetadataWriter4_1.MetadataWriter4();
            }
            else if (version.value <= 986) {
                writer = new MetadataWriter5_1.MetadataWriter5();
            }
            else {
                writer = new MetadataWriter6_1.MetadataWriter6();
            }
            // Write header
            writer.writeUnsignedInt(version.datSignature); // Write signature
            writer.writeShort(this._itemsCount); // Write items count
            writer.writeShort(this._outfitsCount); // Write outfits count
            writer.writeShort(this._effectsCount); // Write effects count
            writer.writeShort(this._missilesCount); // Write missiles count
            if (!this.writeItemList(writer, this._items, ThingTypeStorage.MIN_ITEM_ID, this._itemsCount, version, extended, frameDurations)) {
                done = false;
            }
            if (done && !this.writeThingList(writer, this._outfits, ThingTypeStorage.MIN_OUTFIT_ID, this._outfitsCount, version, extended, frameDurations, frameGroups)) {
                done = false;
            }
            if (done && !this.writeThingList(writer, this._effects, ThingTypeStorage.MIN_EFFECT_ID, this._effectsCount, version, extended, frameDurations, false)) {
                done = false;
            }
            if (done && !this.writeThingList(writer, this._missiles, ThingTypeStorage.MIN_MISSILE_ID, this._missilesCount, version, extended, frameDurations, false)) {
                done = false;
            }
            if (done) {
                // Write to temporary file first
                const buffer = writer.toBuffer();
                fs.writeFileSync(tmpFilePath, buffer);
                // Delete old file if it exists
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                // Rename temporary file
                fs.renameSync(tmpFilePath, filePath);
                this._file = filePath;
                this._changed = false;
            }
            else if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
        }
        catch (error) {
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
            this.emit("error", new Error(error.message || error));
            done = false;
        }
        this.emit(StorageEvent_1.StorageEvent.COMPILE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.COMPILE));
        this.emit(StorageEvent_1.StorageEvent.CHANGE, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.CHANGE));
        return done;
    }
    hasThingType(category, id) {
        if (this._loaded && category) {
            switch (category) {
                case ThingCategory_1.ThingCategory.ITEM:
                    return this._items.has(id);
                case ThingCategory_1.ThingCategory.OUTFIT:
                    return this._outfits.has(id);
                case ThingCategory_1.ThingCategory.EFFECT:
                    return this._effects.has(id);
                case ThingCategory_1.ThingCategory.MISSILE:
                    return this._missiles.has(id);
            }
        }
        return false;
    }
    getThingType(id, category) {
        if (this._loaded && category) {
            switch (category) {
                case ThingCategory_1.ThingCategory.ITEM:
                    return this.getItemType(id);
                case ThingCategory_1.ThingCategory.OUTFIT:
                    return this.getOutfitType(id);
                case ThingCategory_1.ThingCategory.EFFECT:
                    return this.getEffectType(id);
                case ThingCategory_1.ThingCategory.MISSILE:
                    return this.getMissileType(id);
            }
        }
        return null;
    }
    getItemType(id) {
        if (this._loaded && id >= ThingTypeStorage.MIN_ITEM_ID && id <= this._itemsCount && this._items.has(id)) {
            const thing = this._items.get(id);
            if (!ThingUtils_1.ThingUtils.isValid(thing)) {
                // Log.error(Resources.getString("failedToGetThing", ThingCategory.ITEM, id));
                const alertThing = ThingUtils_1.ThingUtils.createAlertThing(ThingCategory_1.ThingCategory.ITEM, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.ITEM));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }
    getOutfitType(id) {
        if (this._loaded && id >= ThingTypeStorage.MIN_OUTFIT_ID && id <= this._outfitsCount && this._outfits.has(id)) {
            const thing = this._outfits.get(id);
            if (!ThingUtils_1.ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils_1.ThingUtils.createAlertThing(ThingCategory_1.ThingCategory.OUTFIT, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.OUTFIT));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }
    getEffectType(id) {
        if (this._loaded && id >= ThingTypeStorage.MIN_EFFECT_ID && id <= this._effectsCount && this._effects.has(id)) {
            const thing = this._effects.get(id);
            if (!ThingUtils_1.ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils_1.ThingUtils.createAlertThing(ThingCategory_1.ThingCategory.EFFECT, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.EFFECT));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }
    getMissileType(id) {
        if (this._loaded && id >= ThingTypeStorage.MIN_MISSILE_ID && id <= this._missilesCount && this._missiles.has(id)) {
            const thing = this._missiles.get(id);
            if (!ThingUtils_1.ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils_1.ThingUtils.createAlertThing(ThingCategory_1.ThingCategory.MISSILE, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.MISSILE));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }
    getMinId(category) {
        if (this._loaded && ThingCategory_1.ThingCategory.getCategory(category)) {
            switch (category) {
                case ThingCategory_1.ThingCategory.ITEM:
                    return ThingTypeStorage.MIN_ITEM_ID;
                case ThingCategory_1.ThingCategory.OUTFIT:
                    return ThingTypeStorage.MIN_OUTFIT_ID;
                case ThingCategory_1.ThingCategory.EFFECT:
                    return ThingTypeStorage.MIN_EFFECT_ID;
                case ThingCategory_1.ThingCategory.MISSILE:
                    return ThingTypeStorage.MIN_MISSILE_ID;
            }
        }
        return 0;
    }
    getMaxId(category) {
        if (this._loaded && ThingCategory_1.ThingCategory.getCategory(category)) {
            switch (category) {
                case ThingCategory_1.ThingCategory.ITEM:
                    return this._itemsCount;
                case ThingCategory_1.ThingCategory.OUTFIT:
                    return this._outfitsCount;
                case ThingCategory_1.ThingCategory.EFFECT:
                    return this._effectsCount;
                case ThingCategory_1.ThingCategory.MISSILE:
                    return this._missilesCount;
            }
        }
        return 0;
    }
    findThingTypeByProperties(category, properties) {
        // TODO: Implement property-based search
        return [];
    }
    invalidate() {
        this._changed = true;
    }
    unload() {
        this._file = null;
        this._version = null;
        this._items.clear();
        this._outfits.clear();
        this._effects.clear();
        this._missiles.clear();
        this._itemsCount = ThingTypeStorage.MIN_ITEM_ID;
        this._outfitsCount = ThingTypeStorage.MIN_OUTFIT_ID;
        this._effectsCount = ThingTypeStorage.MIN_EFFECT_ID;
        this._missilesCount = ThingTypeStorage.MIN_MISSILE_ID;
        this._changed = false;
        this._loaded = false;
        this.emit(StorageEvent_1.StorageEvent.UNLOAD, new StorageEvent_1.StorageEvent(StorageEvent_1.StorageEvent.UNLOAD));
    }
    // Internal methods
    internalAddThing(thing, category) {
        // TODO: Implement internal add logic
        return new ChangeResult_1.ChangeResult([thing], true);
    }
    internalAddThings(things) {
        // TODO: Implement internal add multiple logic
        return new ChangeResult_1.ChangeResult(things, true);
    }
    internalReplaceThing(thing, category, replaceId) {
        const list = this.getListForCategory(category);
        if (list) {
            const oldThing = list.get(replaceId);
            list.set(replaceId, thing);
            return new ChangeResult_1.ChangeResult([oldThing], true);
        }
        return new ChangeResult_1.ChangeResult(null, false, "Invalid category");
    }
    internalReplaceThings(things) {
        const replaced = [];
        for (const thing of things) {
            const list = this.getListForCategory(thing.category);
            if (list) {
                const oldThing = list.get(thing.id);
                list.set(thing.id, thing);
                if (oldThing) {
                    replaced.push(oldThing);
                }
            }
        }
        return new ChangeResult_1.ChangeResult(replaced, true);
    }
    internalRemoveThing(id, category) {
        const list = this.getListForCategory(category);
        if (list && list.has(id)) {
            const thing = list.get(id);
            list.delete(id);
            return new ChangeResult_1.ChangeResult([thing], true);
        }
        return new ChangeResult_1.ChangeResult(null, false, "Thing not found");
    }
    internalRemoveThings(things, category) {
        const list = this.getListForCategory(category);
        if (!list) {
            return new ChangeResult_1.ChangeResult(null, false, "Invalid category");
        }
        const removed = [];
        things.sort((a, b) => b - a); // Sort descending
        for (const id of things) {
            if (list.has(id)) {
                const thing = list.get(id);
                list.delete(id);
                removed.push(thing);
            }
        }
        return new ChangeResult_1.ChangeResult(removed, true);
    }
    getListForCategory(category) {
        switch (category) {
            case ThingCategory_1.ThingCategory.ITEM:
                return this._items;
            case ThingCategory_1.ThingCategory.OUTFIT:
                return this._outfits;
            case ThingCategory_1.ThingCategory.EFFECT:
                return this._effects;
            case ThingCategory_1.ThingCategory.MISSILE:
                return this._missiles;
            default:
                return null;
        }
    }
    readBytes(reader) {
        if (reader.bytesAvailable < 12) {
            throw new Error("Not enough data.");
        }
        this._items = new Map();
        this._outfits = new Map();
        this._effects = new Map();
        this._missiles = new Map();
        this._signature = reader.readSignature();
        this._itemsCount = reader.readItemsCount();
        this._outfitsCount = reader.readOutfitsCount();
        this._effectsCount = reader.readEffectsCount();
        this._missilesCount = reader.readMissilesCount();
        this._thingsCount = this._itemsCount + this._outfitsCount + this._effectsCount + this._missilesCount;
        this._progressCount = 0;
        // Load item list.
        if (!this.loadThingTypeList(reader, this._items, ThingTypeStorage.MIN_ITEM_ID, this._itemsCount, ThingCategory_1.ThingCategory.ITEM)) {
            throw new Error("Items list cannot be created.");
        }
        // Load outfit list.
        if (!this.loadThingTypeList(reader, this._outfits, ThingTypeStorage.MIN_OUTFIT_ID, this._outfitsCount, ThingCategory_1.ThingCategory.OUTFIT)) {
            throw new Error("Outfits list cannot be created.");
        }
        // Load effect list.
        if (!this.loadThingTypeList(reader, this._effects, ThingTypeStorage.MIN_EFFECT_ID, this._effectsCount, ThingCategory_1.ThingCategory.EFFECT)) {
            throw new Error("Effects list cannot be created.");
        }
        // Load missile list.
        if (!this.loadThingTypeList(reader, this._missiles, ThingTypeStorage.MIN_MISSILE_ID, this._missilesCount, ThingCategory_1.ThingCategory.MISSILE)) {
            throw new Error("Missiles list cannot be created.");
        }
        if (reader.bytesAvailable !== 0) {
            throw new Error("An unknown error occurred while reading the file '*.dat'");
        }
    }
    loadThingTypeList(reader, list, minID, maxID, category) {
        const dispatchProgress = this.listenerCount(ProgressEvent_1.ProgressEvent.PROGRESS) > 0;
        for (let id = minID; id <= maxID; id++) {
            const thing = new ThingType_1.ThingType();
            thing.id = id;
            thing.category = category;
            if (!reader.readProperties(thing)) {
                return false;
            }
            if (!reader.readTexturePatterns(thing, this._extended, this._improvedAnimations, this._frameGroups)) {
                return false;
            }
            list.set(id, thing);
            if (dispatchProgress) {
                this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.METADATA, this._progressCount, this._thingsCount));
                this._progressCount++;
            }
        }
        return true;
    }
    writeThingList(writer, list, minId, maxId, version, extended, frameDurations, frameGroups) {
        const dispatchProgress = this.listenerCount(ProgressEvent_1.ProgressEvent.PROGRESS) > 0;
        for (let id = minId; id <= maxId; id++) {
            const thing = list.get(id);
            if (thing) {
                if (!writer.writeProperties(thing)) {
                    return false;
                }
                if (!writer.writeTexturePatterns(thing, extended, frameDurations, frameGroups)) {
                    return false;
                }
            }
            else {
                writer.writeByte(MetadataFlags1_1.MetadataFlags1.LAST_FLAG); // Close flags
            }
            if (dispatchProgress) {
                this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.METADATA, this._progressCount, this._thingsCount));
                this._progressCount++;
            }
        }
        return true;
    }
    writeItemList(writer, list, minId, maxId, version, extended, frameDurations) {
        const dispatchProgress = this.listenerCount(ProgressEvent_1.ProgressEvent.PROGRESS) > 0;
        for (let id = minId; id <= maxId; id++) {
            const item = list.get(id);
            if (item) {
                if (!writer.writeItemProperties(item)) {
                    return false;
                }
                if (!writer.writeTexturePatterns(item, extended, frameDurations, false)) {
                    return false;
                }
            }
            else {
                writer.writeByte(MetadataFlags1_1.MetadataFlags1.LAST_FLAG); // Close flags
            }
            if (dispatchProgress) {
                this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.METADATA, this._progressCount, this._thingsCount));
                this._progressCount++;
            }
        }
        return true;
    }
}
exports.ThingTypeStorage = ThingTypeStorage;
ThingTypeStorage.MIN_ITEM_ID = 100;
ThingTypeStorage.MIN_OUTFIT_ID = 1;
ThingTypeStorage.MIN_EFFECT_ID = 1;
ThingTypeStorage.MIN_MISSILE_ID = 1;
ThingTypeStorage.CHANGE_RESULT_HELPER = new ChangeResult_1.ChangeResult();

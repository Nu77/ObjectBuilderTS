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
import { ThingType } from "./ThingType";
import { ThingCategory } from "./ThingCategory";
import { Version } from "../core/Version";
import { IStorage } from "../storages/IStorage";
import { StorageEvent } from "../storages/events/StorageEvent";
import { ChangeResult } from "../utils/ChangeResult";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";
import { Resources } from "../resources/Resources";
import { ThingUtils } from "../utils/ThingUtils";
import { MetadataReader } from "./MetadataReader";
import { MetadataReader1 } from "./MetadataReader1";
import { MetadataReader2 } from "./MetadataReader2";
import { MetadataReader3 } from "./MetadataReader3";
import { MetadataReader4 } from "./MetadataReader4";
import { MetadataReader5 } from "./MetadataReader5";
import { MetadataReader6 } from "./MetadataReader6";
import { MetadataWriter } from "./MetadataWriter";
import { MetadataWriter1 } from "./MetadataWriter1";
import { MetadataWriter2 } from "./MetadataWriter2";
import { MetadataWriter3 } from "./MetadataWriter3";
import { MetadataWriter4 } from "./MetadataWriter4";
import { MetadataWriter5 } from "./MetadataWriter5";
import { MetadataWriter6 } from "./MetadataWriter6";
import { MetadataFlags1 } from "./MetadataFlags1";
import { ByteArray } from "../utils/ByteArray";
import * as path from "path";

export class ThingTypeStorage extends EventEmitter implements IStorage {
    public static readonly MIN_ITEM_ID: number = 100;
    public static readonly MIN_OUTFIT_ID: number = 1;
    public static readonly MIN_EFFECT_ID: number = 1;
    public static readonly MIN_MISSILE_ID: number = 1;

    private static readonly CHANGE_RESULT_HELPER: ChangeResult = new ChangeResult();

    private _file: string | null = null;
    private _version: Version | null = null;
    private _signature: number = 0;
    private _items: Map<number, ThingType> = new Map();
    private _itemsCount: number = ThingTypeStorage.MIN_ITEM_ID;
    private _outfits: Map<number, ThingType> = new Map();
    private _outfitsCount: number = ThingTypeStorage.MIN_OUTFIT_ID;
    private _effects: Map<number, ThingType> = new Map();
    private _effectsCount: number = ThingTypeStorage.MIN_EFFECT_ID;
    private _missiles: Map<number, ThingType> = new Map();
    private _missilesCount: number = ThingTypeStorage.MIN_MISSILE_ID;
    private _thingsCount: number = 0;
    private _extended: boolean = false;
    private _improvedAnimations: boolean = false;
    private _frameGroups: boolean = false;
    private _progressCount: number = 0;
    private _changed: boolean = false;
    private _loaded: boolean = false;
    private _settings: ObjectBuilderSettings;

    public get file(): string | null { return this._file; }
    public get version(): Version | null { return this._version; }
    public get signature(): number { return this._signature; }
    public get items(): Map<number, ThingType> { return this._items; }
    public get outfits(): Map<number, ThingType> { return this._outfits; }
    public get effects(): Map<number, ThingType> { return this._effects; }
    public get missiles(): Map<number, ThingType> { return this._missiles; }
    public get itemsCount(): number { return this._itemsCount; }
    public get outfitsCount(): number { return this._outfitsCount; }
    public get effectsCount(): number { return this._effectsCount; }
    public get missilesCount(): number { return this._missilesCount; }
    public get changed(): boolean { return this._changed; }
    public get isTemporary(): boolean { return (this._loaded && this._file === null); }
    public get loaded(): boolean { return this._loaded; }

    constructor(settings: ObjectBuilderSettings) {
        super();
        this._settings = settings;
    }

    public load(filePath: string,
                version: Version,
                extended: boolean = false,
                improvedAnimations: boolean = false,
                frameGroups: boolean = false): void {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (!version) {
            throw new Error("version cannot be null");
        }

        if (this.loaded) return;

        this._version = version;
        this._extended = (extended || version.value >= 960);
        this._improvedAnimations = (improvedAnimations || version.value >= 1050);
        this._frameGroups = (frameGroups || version.value >= 1057);

        try {
            // Read file into ByteArray
            const fileBuffer = fs.readFileSync(filePath);
            const bytes = ByteArray.fromBuffer(fileBuffer);

            // Create version-specific reader
            let reader: MetadataReader;
            if (version.value <= 730) {
                reader = new MetadataReader1(bytes);
            } else if (version.value <= 750) {
                reader = new MetadataReader2(bytes);
            } else if (version.value <= 772) {
                reader = new MetadataReader3(bytes);
            } else if (version.value <= 854) {
                reader = new MetadataReader4(bytes);
            } else if (version.value <= 986) {
                reader = new MetadataReader5(bytes);
            } else {
                reader = new MetadataReader6(bytes);
            }

            reader.setSettings(this._settings);
            this.readBytes(reader);
        } catch (error: any) {
            this.emit("error", new Error(error.message || error));
            return;
        }

        this._file = filePath;
        this._changed = false;
        this._loaded = true;

        this.emit(StorageEvent.LOAD, new StorageEvent(StorageEvent.LOAD));
        this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
    }

    public createNew(version: Version,
                     extended: boolean,
                     improvedAnimations: boolean,
                     frameGroups: boolean): void {
        if (!version) {
            throw new Error("version cannot be null");
        }

        if (this.loaded) return;

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
        this._items.set(this._itemsCount, ThingType.create(this._itemsCount, ThingCategory.ITEM, this._frameGroups, this._settings.getDefaultDuration(ThingCategory.ITEM)));
        this._outfits.set(this._outfitsCount, ThingType.create(this._outfitsCount, ThingCategory.OUTFIT, this._frameGroups, this._settings.getDefaultDuration(ThingCategory.OUTFIT)));
        this._effects.set(this._effectsCount, ThingType.create(this._effectsCount, ThingCategory.EFFECT, this._frameGroups, this._settings.getDefaultDuration(ThingCategory.EFFECT)));
        this._missiles.set(this._missilesCount, ThingType.create(this._missilesCount, ThingCategory.MISSILE, this._frameGroups, this._settings.getDefaultDuration(ThingCategory.MISSILE)));

        this._changed = false;
        this._loaded = true;

        this.emit(StorageEvent.LOAD, new StorageEvent(StorageEvent.LOAD));
    }

    public addThing(thing: ThingType, category: string): ChangeResult {
        if (!thing) {
            throw new Error("thing cannot be null");
        }

        if (!ThingCategory.getCategory(category)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        const result = this.internalAddThing(thing, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public addThings(things: ThingType[]): ChangeResult {
        if (!things) {
            throw new Error("things cannot be null");
        }

        const result = this.internalAddThings(things);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public replaceThing(thing: ThingType, category: string, replaceId: number): ChangeResult {
        if (!thing) {
            throw new Error("thing cannot be null");
        }

        if (!ThingCategory.getCategory(category)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        if (!this.hasThingType(category, replaceId)) {
            throw new Error(Resources.getString("thingNotFound", Resources.getString(category), replaceId));
        }

        const result = this.internalReplaceThing(thing, category, replaceId);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public replaceThings(things: ThingType[]): ChangeResult {
        if (!things) {
            throw new Error("things cannot be null");
        }

        const result = this.internalReplaceThings(things);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public removeThing(id: number, category: string): ChangeResult {
        if (!ThingCategory.getCategory(category)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        if (!this.hasThingType(category, id)) {
            throw new Error(Resources.getString("thingNotFound", Resources.getString(category), id));
        }

        const result = this.internalRemoveThing(id, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public removeThings(things: number[], category: string): ChangeResult {
        if (!things) {
            throw new Error("things cannot be null");
        }

        if (!ThingCategory.getCategory(category)) {
            throw new Error(Resources.getString("invalidCategory"));
        }

        const result = this.internalRemoveThings(things, category);
        if (result.done) {
            this._changed = true;
            this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));
        }
        return result;
    }

    public compile(filePath: string, version: Version, extended: boolean, frameDurations: boolean, frameGroups: boolean): boolean {
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
            let writer: MetadataWriter;
            if (version.value <= 730) {
                writer = new MetadataWriter1();
            } else if (version.value <= 750) {
                writer = new MetadataWriter2();
            } else if (version.value <= 772) {
                writer = new MetadataWriter3();
            } else if (version.value <= 854) {
                writer = new MetadataWriter4();
            } else if (version.value <= 986) {
                writer = new MetadataWriter5();
            } else {
                writer = new MetadataWriter6();
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
            } else if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
        } catch (error: any) {
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
            this.emit("error", new Error(error.message || error));
            done = false;
        }

        this.emit(StorageEvent.COMPILE, new StorageEvent(StorageEvent.COMPILE));
        this.emit(StorageEvent.CHANGE, new StorageEvent(StorageEvent.CHANGE));

        return done;
    }

    public hasThingType(category: string, id: number): boolean {
        if (this._loaded && category) {
            switch (category) {
                case ThingCategory.ITEM:
                    return this._items.has(id);
                case ThingCategory.OUTFIT:
                    return this._outfits.has(id);
                case ThingCategory.EFFECT:
                    return this._effects.has(id);
                case ThingCategory.MISSILE:
                    return this._missiles.has(id);
            }
        }
        return false;
    }

    public getThingType(id: number, category: string): ThingType | null {
        if (this._loaded && category) {
            switch (category) {
                case ThingCategory.ITEM:
                    return this.getItemType(id);
                case ThingCategory.OUTFIT:
                    return this.getOutfitType(id);
                case ThingCategory.EFFECT:
                    return this.getEffectType(id);
                case ThingCategory.MISSILE:
                    return this.getMissileType(id);
            }
        }
        return null;
    }

    public getItemType(id: number): ThingType | null {
        if (this._loaded && id >= ThingTypeStorage.MIN_ITEM_ID && id <= this._itemsCount && this._items.has(id)) {
            const thing = this._items.get(id)!;
            if (!ThingUtils.isValid(thing)) {
                // Log.error(Resources.getString("failedToGetThing", ThingCategory.ITEM, id));
                const alertThing = ThingUtils.createAlertThing(ThingCategory.ITEM, this._settings.getDefaultDuration(ThingCategory.ITEM));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }

    public getOutfitType(id: number): ThingType | null {
        if (this._loaded && id >= ThingTypeStorage.MIN_OUTFIT_ID && id <= this._outfitsCount && this._outfits.has(id)) {
            const thing = this._outfits.get(id)!;
            if (!ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils.createAlertThing(ThingCategory.OUTFIT, this._settings.getDefaultDuration(ThingCategory.OUTFIT));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }

    public getEffectType(id: number): ThingType | null {
        if (this._loaded && id >= ThingTypeStorage.MIN_EFFECT_ID && id <= this._effectsCount && this._effects.has(id)) {
            const thing = this._effects.get(id)!;
            if (!ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils.createAlertThing(ThingCategory.EFFECT, this._settings.getDefaultDuration(ThingCategory.EFFECT));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }

    public getMissileType(id: number): ThingType | null {
        if (this._loaded && id >= ThingTypeStorage.MIN_MISSILE_ID && id <= this._missilesCount && this._missiles.has(id)) {
            const thing = this._missiles.get(id)!;
            if (!ThingUtils.isValid(thing)) {
                const alertThing = ThingUtils.createAlertThing(ThingCategory.MISSILE, this._settings.getDefaultDuration(ThingCategory.MISSILE));
                alertThing.id = id;
                return alertThing;
            }
            return thing;
        }
        return null;
    }

    public getMinId(category: string): number {
        if (this._loaded && ThingCategory.getCategory(category)) {
            switch (category) {
                case ThingCategory.ITEM:
                    return ThingTypeStorage.MIN_ITEM_ID;
                case ThingCategory.OUTFIT:
                    return ThingTypeStorage.MIN_OUTFIT_ID;
                case ThingCategory.EFFECT:
                    return ThingTypeStorage.MIN_EFFECT_ID;
                case ThingCategory.MISSILE:
                    return ThingTypeStorage.MIN_MISSILE_ID;
            }
        }
        return 0;
    }

    public getMaxId(category: string): number {
        if (this._loaded && ThingCategory.getCategory(category)) {
            switch (category) {
                case ThingCategory.ITEM:
                    return this._itemsCount;
                case ThingCategory.OUTFIT:
                    return this._outfitsCount;
                case ThingCategory.EFFECT:
                    return this._effectsCount;
                case ThingCategory.MISSILE:
                    return this._missilesCount;
            }
        }
        return 0;
    }

    public findThingTypeByProperties(category: string, properties: any[]): ThingType[] {
        // TODO: Implement property-based search
        return [];
    }

    public invalidate(): void {
        this._changed = true;
    }

    public unload(): void {
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

        this.emit(StorageEvent.UNLOAD, new StorageEvent(StorageEvent.UNLOAD));
    }

    // Internal methods
    private internalAddThing(thing: ThingType, category: string): ChangeResult {
        // TODO: Implement internal add logic
        return new ChangeResult([thing], true);
    }

    private internalAddThings(things: ThingType[]): ChangeResult {
        // TODO: Implement internal add multiple logic
        return new ChangeResult(things, true);
    }

    private internalReplaceThing(thing: ThingType, category: string, replaceId: number): ChangeResult {
        const list = this.getListForCategory(category);
        if (list) {
            const oldThing = list.get(replaceId);
            list.set(replaceId, thing);
            return new ChangeResult([oldThing], true);
        }
        return new ChangeResult(null, false, "Invalid category");
    }

    private internalReplaceThings(things: ThingType[]): ChangeResult {
        const replaced: ThingType[] = [];
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
        return new ChangeResult(replaced, true);
    }

    private internalRemoveThing(id: number, category: string): ChangeResult {
        const list = this.getListForCategory(category);
        if (list && list.has(id)) {
            const thing = list.get(id)!;
            list.delete(id);
            return new ChangeResult([thing], true);
        }
        return new ChangeResult(null, false, "Thing not found");
    }

    private internalRemoveThings(things: number[], category: string): ChangeResult {
        const list = this.getListForCategory(category);
        if (!list) {
            return new ChangeResult(null, false, "Invalid category");
        }

        const removed: ThingType[] = [];
        things.sort((a, b) => b - a); // Sort descending

        for (const id of things) {
            if (list.has(id)) {
                const thing = list.get(id)!;
                list.delete(id);
                removed.push(thing);
            }
        }

        return new ChangeResult(removed, true);
    }

    private getListForCategory(category: string): Map<number, ThingType> | null {
        switch (category) {
            case ThingCategory.ITEM:
                return this._items;
            case ThingCategory.OUTFIT:
                return this._outfits;
            case ThingCategory.EFFECT:
                return this._effects;
            case ThingCategory.MISSILE:
                return this._missiles;
            default:
                return null;
        }
    }

    protected readBytes(reader: MetadataReader): void {
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
        if (!this.loadThingTypeList(reader, this._items, ThingTypeStorage.MIN_ITEM_ID, this._itemsCount, ThingCategory.ITEM)) {
            throw new Error("Items list cannot be created.");
        }

        // Load outfit list.
        if (!this.loadThingTypeList(reader, this._outfits, ThingTypeStorage.MIN_OUTFIT_ID, this._outfitsCount, ThingCategory.OUTFIT)) {
            throw new Error("Outfits list cannot be created.");
        }

        // Load effect list.
        if (!this.loadThingTypeList(reader, this._effects, ThingTypeStorage.MIN_EFFECT_ID, this._effectsCount, ThingCategory.EFFECT)) {
            throw new Error("Effects list cannot be created.");
        }

        // Load missile list.
        if (!this.loadThingTypeList(reader, this._missiles, ThingTypeStorage.MIN_MISSILE_ID, this._missilesCount, ThingCategory.MISSILE)) {
            throw new Error("Missiles list cannot be created.");
        }

        if (reader.bytesAvailable !== 0) {
            throw new Error("An unknown error occurred while reading the file '*.dat'");
        }
    }

    protected loadThingTypeList(reader: MetadataReader,
                                list: Map<number, ThingType>,
                                minID: number,
                                maxID: number,
                                category: string): boolean {
        const dispatchProgress = this.listenerCount(ProgressEvent.PROGRESS) > 0;

        for (let id = minID; id <= maxID; id++) {
            const thing = new ThingType();
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
                this.emit(ProgressEvent.PROGRESS, new ProgressEvent(
                    ProgressEvent.PROGRESS,
                    ProgressBarID.METADATA,
                    this._progressCount,
                    this._thingsCount));
                this._progressCount++;
            }
        }
        return true;
    }

    protected writeThingList(writer: MetadataWriter,
                            list: Map<number, ThingType>,
                            minId: number,
                            maxId: number,
                            version: Version,
                            extended: boolean,
                            frameDurations: boolean,
                            frameGroups: boolean): boolean {
        const dispatchProgress = this.listenerCount(ProgressEvent.PROGRESS) > 0;

        for (let id = minId; id <= maxId; id++) {
            const thing = list.get(id);
            if (thing) {
                if (!writer.writeProperties(thing)) {
                    return false;
                }

                if (!writer.writeTexturePatterns(thing, extended, frameDurations, frameGroups)) {
                    return false;
                }
            } else {
                writer.writeByte(MetadataFlags1.LAST_FLAG); // Close flags
            }

            if (dispatchProgress) {
                this.emit(ProgressEvent.PROGRESS, new ProgressEvent(
                    ProgressEvent.PROGRESS,
                    ProgressBarID.METADATA,
                    this._progressCount,
                    this._thingsCount));
                this._progressCount++;
            }
        }

        return true;
    }

    protected writeItemList(writer: MetadataWriter,
                            list: Map<number, ThingType>,
                            minId: number,
                            maxId: number,
                            version: Version,
                            extended: boolean,
                            frameDurations: boolean): boolean {
        const dispatchProgress = this.listenerCount(ProgressEvent.PROGRESS) > 0;

        for (let id = minId; id <= maxId; id++) {
            const item = list.get(id);
            if (item) {
                if (!writer.writeItemProperties(item)) {
                    return false;
                }

                if (!writer.writeTexturePatterns(item, extended, frameDurations, false)) {
                    return false;
                }
            } else {
                writer.writeByte(MetadataFlags1.LAST_FLAG); // Close flags
            }

            if (dispatchProgress) {
                this.emit(ProgressEvent.PROGRESS, new ProgressEvent(
                    ProgressEvent.PROGRESS,
                    ProgressBarID.METADATA,
                    this._progressCount,
                    this._thingsCount));
                this._progressCount++;
            }
        }

        return true;
    }
}


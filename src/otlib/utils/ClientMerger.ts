import { EventEmitter } from "events";
import * as fs from "fs";
import { ThingTypeStorage } from "../things/ThingTypeStorage";
import { SpriteStorage } from "../sprites/SpriteStorage";
import { Version } from "../core/Version";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";
import { ThingType } from "../things/ThingType";
import { FrameGroup } from "../animation/FrameGroup";
import { FrameGroupType } from "../things/FrameGroupType";
import { ByteArray } from "../utils/ByteArray";
import { ChangeResult } from "./ChangeResult";
import { ThingUtils } from "./ThingUtils";
import { SpritesOptimizer } from "./SpritesOptimizer";
import { StorageQueueLoader } from "../storages/StorageQueueLoader";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";

export class ClientMerger extends EventEmitter {
    private _objects: ThingTypeStorage | null = null;
    private _sprites: SpriteStorage | null = null;
    private _spriteIds: Map<number, number> = new Map();
    private _itemsCount: number = 0;
    private _outfitsCount: number = 0;
    private _effectsCount: number = 0;
    private _missilesCount: number = 0;
    private _spritesCount: number = 0;

    private _currentObjects: ThingTypeStorage;
    private _currentSprites: SpriteStorage;
    private _settings: ObjectBuilderSettings;

    public get itemsCount(): number { return this._itemsCount; }
    public get outfitsCount(): number { return this._outfitsCount; }
    public get effectsCount(): number { return this._effectsCount; }
    public get missilesCount(): number { return this._missilesCount; }
    public get spritesCount(): number { return this._spritesCount; }

    constructor(objects: ThingTypeStorage, sprites: SpriteStorage, settings: ObjectBuilderSettings) {
        super();

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

    public start(datFile: string,
                 sprFile: string,
                 version: Version,
                 extended: boolean,
                 improvedAnimations: boolean,
                 frameGroups: boolean,
                 transparency: boolean,
                 optimizeSprites: boolean = true): void {
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

        this._objects = new ThingTypeStorage(this._settings);
        this._objects.on("error", this.errorHandler.bind(this));

        this._sprites = new SpriteStorage();
        this._sprites.on("error", this.errorHandler.bind(this));

        const loader = new StorageQueueLoader();
        loader.on("complete", () => {
            loader.removeAllListeners("complete");

            if (optimizeSprites) {
                this.startOptimizeSprites();
            } else {
                this.startMerge();
            }
        });

        loader.add(this._objects, this._objects.load, datFile, version, extended, improvedAnimations, frameGroups);
        loader.add(this._sprites, this._sprites.load, sprFile, version, extended, transparency);
        loader.start();
    }

    private startOptimizeSprites(): void {
        if (!this._objects || !this._sprites) {
            return;
        }

        const optimizer = new SpritesOptimizer(this._objects, this._sprites);
        optimizer.on("progress", (event: ProgressEvent) => {
            this.emit("progress", event);
        });

        optimizer.on("complete", () => {
            this.startMerge();
        });

        optimizer.start();
    }

    private startMerge(): void {
        if (!this._objects || !this._sprites) {
            return;
        }

        const oldItemsCount = this._currentObjects.itemsCount;
        const oldOutfitsCount = this._currentObjects.outfitsCount;
        const oldEffectsCount = this._currentObjects.effectsCount;
        const oldMissilesCount = this._currentObjects.missilesCount;
        const oldSpritesCount = this._currentSprites.spritesCount;

        this.mergeSpriteList(1, this._sprites.spritesCount);
        this.emit("progress", new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, 1, 5));

        this.mergeObjectList(this._objects.items, 100, this._objects.itemsCount);
        this.emit("progress", new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, 2, 5));

        this.mergeObjectList(this._objects.outfits, 1, this._objects.outfitsCount);
        this.emit("progress", new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, 3, 5));

        this.mergeObjectList(this._objects.effects, 1, this._objects.effectsCount);
        this.emit("progress", new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, 4, 5));

        this.mergeObjectList(this._objects.missiles, 1, this._objects.missilesCount);
        this.emit("progress", new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, 5, 5));

        this._currentObjects.invalidate();
        this._currentSprites.invalidate();
        this._itemsCount = this._currentObjects.itemsCount - oldItemsCount;
        this._outfitsCount = this._currentObjects.outfitsCount - oldOutfitsCount;
        this._effectsCount = this._currentObjects.effectsCount - oldEffectsCount;
        this._missilesCount = this._currentObjects.missilesCount - oldMissilesCount;
        this._spritesCount = this._currentSprites.spritesCount - oldSpritesCount;

        this.emit("complete");
    }

    private mergeSpriteList(min: number, max: number): void {
        if (!this._sprites) {
            return;
        }

        this._spriteIds = new Map();

        for (let id = min; id <= max; id++) {
            if (this._sprites.isEmptySprite(id)) {
                this._spriteIds.set(id, 0);
            } else {
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

    private mergeObjectList(list: Map<number, ThingType>, min: number, max: number): void {
        const objects: ThingType[] = [];

        for (let id = min; id <= max; id++) {
            const type = list.get(id);
            if (!type) {
                continue;
            }

            if (ThingUtils.isEmpty(type)) {
                continue;
            }

            for (let groupType = FrameGroupType.DEFAULT; groupType <= FrameGroupType.WALKING; groupType++) {
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
                        } else {
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

    private errorHandler(error: Error): void {
        console.error("ClientMerger error:", error);
    }
}


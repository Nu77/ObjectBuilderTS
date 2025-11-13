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
            
            // Use synchronous XML parsing with xml2js
            // xml2js.parseStringSync doesn't exist, so we use parseString with util.promisify and deasync
            const xml2js = require("xml2js");
            const util = require("util");
            const deasync = require("deasync");
            const parser = new xml2js.Parser({ explicitArray: false });
            const parseString = util.promisify(parser.parseString.bind(parser));
            
            // Use deasync to make the async parseString synchronous
            let result: any = null;
            let parseError: Error | null = null;
            let completed = false;
            
            parseString(xmlContent)
                .then((parsed: any) => {
                    result = parsed;
                    completed = true;
                })
                .catch((err: Error) => {
                    parseError = err;
                    completed = true;
                });
            
            // Wait synchronously using deasync
            deasync.loopWhile(() => !completed);
            
            if (parseError) {
                throw parseError;
            }

            if (!result || result.sprites === undefined || !result.sprites.sprite) {
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


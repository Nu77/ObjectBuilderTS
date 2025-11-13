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
import { Version } from "./Version";
import { IVersionStorage } from "./IVersionStorage";
import { ClientInfo } from "../utils/ClientInfo";
import { OTFormat } from "../utils/OTFormat";

export class VersionStorage extends EventEmitter implements IVersionStorage {
    private static _instance: IVersionStorage | null = null;

    private _file: string | null = null;
    private _versions: Map<string, Version> = new Map();
    private _changed: boolean = false;
    private _loaded: boolean = false;

    public get file(): string | null { return this._file; }
    public get changed(): boolean { return this._changed; }
    public get loaded(): boolean { return this._loaded; }

    constructor() {
        super();
        if (VersionStorage._instance) {
            throw new Error("VersionStorage is a singleton class");
        }
        VersionStorage._instance = this;
    }

    public static getInstance(): IVersionStorage {
        if (!VersionStorage._instance) {
            VersionStorage._instance = new VersionStorage();
        }
        return VersionStorage._instance;
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
            
            if (!result || result.versions === undefined || !result.versions.version) {
                throw new Error("Invalid versions XML structure.");
            }

            const versions = Array.isArray(result.versions.version) 
                ? result.versions.version 
                : [result.versions.version];

            for (const versionXML of versions) {
                const version = new Version();
                version.unserialize(versionXML.$);
                this._versions.set(version.valueStr, version);
            }

            this._file = filePath;
            this._changed = false;
            this._loaded = true;
            this.emit("complete");

            return this._loaded;
        } catch (error: any) {
            throw new Error(`Failed to load versions: ${error.message || error}`);
        }
    }

    public addVersion(value: number, dat: number, spr: number, otb: number): Version {
        if (value === 0) {
            throw new Error("VersionStorage.addVersion: Invalid value.");
        }

        if (dat === 0) {
            throw new Error("VersionStorage.addVersion: Invalid dat.");
        }

        if (spr === 0) {
            throw new Error("VersionStorage.addVersion: Invalid spr.");
        }

        let version = this.getBySignatures(dat, spr);

        // If the client version already exists, just update the otb version.
        if (version && version.value === value) {
            if (version.otbVersion !== otb) {
                version.otbVersion = otb;
                this._changed = true;
                this.emit("change");
            }
            return version;
        }

        const vstr = `${Math.floor(value / 100)}.${value % 100}`;
        let index = 1;
        let valueStr = vstr;

        for (const v of this._versions.values()) {
            if (v.valueStr === valueStr) {
                index++;
                valueStr = `${vstr} v${index}`;
            }
        }

        version = new Version();
        version.value = value;
        version.valueStr = valueStr;
        version.datSignature = dat;
        version.sprSignature = spr;
        version.otbVersion = otb;

        this._versions.set(valueStr, version);
        this._changed = true;
        this.emit("change");

        return version;
    }

    public removeVersion(version: Version): Version | null {
        if (!version) {
            throw new Error("version cannot be null");
        }

        for (const [key, v] of this._versions.entries()) {
            if (v === version) {
                this._versions.delete(key);
                this._changed = true;
                this.emit("change");
                return v;
            }
        }

        return null;
    }

    public save(filePath: string): void {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (path.extname(filePath) !== `.${OTFormat.XML}`) {
            throw new Error("VersionStorage.save: Invalid extension");
        }

        if (!this._changed) return;

        const list = this.getList();
        let xml = '<?xml version="1.0" encoding="utf-8"?>\n<versions>\n';

        for (const version of list) {
            const serialized = version.serialize();
            xml += `  <version value="${serialized.value}" string="${serialized.string}" dat="${serialized.dat}" spr="${serialized.spr}" otb="${serialized.otb}"/>\n`;
        }

        xml += "</versions>";

        fs.writeFileSync(filePath, xml, "utf-8");
        this._changed = false;
    }

    public getList(): Version[] {
        const list: Version[] = [];

        for (const version of this._versions.values()) {
            list.push(version);
        }

        if (list.length > 1) {
            list.sort((a, b) => b.value - a.value);
        }

        return list;
    }

    public getFromClientInfo(info: ClientInfo): Version | null {
        for (const version of this._versions.values()) {
            if (version.value === info.clientVersion &&
                version.datSignature === info.datSignature &&
                version.sprSignature === info.sprSignature) {
                return version;
            }
        }
        return null;
    }

    public getByValue(value: number): Version[] {
        const list: Version[] = [];

        for (const version of this._versions.values()) {
            if (version.value === value) {
                list.push(version);
            }
        }
        return list;
    }

    public getByValueString(value: string): Version | null {
        if (value) {
            const version = this._versions.get(value);
            if (version !== undefined) {
                return version;
            }
        }
        return null;
    }

    public getBySignatures(datSignature: number, sprSignature: number): Version | null {
        for (const version of this._versions.values()) {
            if (version.sprSignature === sprSignature &&
                version.datSignature === datSignature) {
                return version;
            }
        }
        return null;
    }

    public getByOtbVersion(otb: number): Version[] {
        const list: Version[] = [];

        for (const version of this._versions.values()) {
            if (version.otbVersion === otb) {
                list.push(version);
            }
        }
        return list;
    }

    public unload(): void {
        this._file = null;
        this._versions.clear();
        this._changed = false;
        this._loaded = false;
    }
}


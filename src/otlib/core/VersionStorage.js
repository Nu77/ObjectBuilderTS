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
exports.VersionStorage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const Version_1 = require("./Version");
const OTFormat_1 = require("../utils/OTFormat");
class VersionStorage extends events_1.EventEmitter {
    get file() { return this._file; }
    get changed() { return this._changed; }
    get loaded() { return this._loaded; }
    constructor() {
        super();
        this._file = null;
        this._versions = new Map();
        this._changed = false;
        this._loaded = false;
        if (VersionStorage._instance) {
            throw new Error("VersionStorage is a singleton class");
        }
        VersionStorage._instance = this;
    }
    static getInstance() {
        if (!VersionStorage._instance) {
            VersionStorage._instance = new VersionStorage();
        }
        return VersionStorage._instance;
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
            if (result.versions === undefined || !result.versions.version) {
                throw new Error("Invalid versions XML structure.");
            }
            const versions = Array.isArray(result.versions.version)
                ? result.versions.version
                : [result.versions.version];
            for (const versionXML of versions) {
                const version = new Version_1.Version();
                version.unserialize(versionXML.$);
                this._versions.set(version.valueStr, version);
            }
            this._file = filePath;
            this._changed = false;
            this._loaded = true;
            this.emit("complete");
            return this._loaded;
        }
        catch (error) {
            throw new Error(`Failed to load versions: ${error.message || error}`);
        }
    }
    addVersion(value, dat, spr, otb) {
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
        version = new Version_1.Version();
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
    removeVersion(version) {
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
    save(filePath) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        if (path.extname(filePath) !== `.${OTFormat_1.OTFormat.XML}`) {
            throw new Error("VersionStorage.save: Invalid extension");
        }
        if (!this._changed)
            return;
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
    getList() {
        const list = [];
        for (const version of this._versions.values()) {
            list.push(version);
        }
        if (list.length > 1) {
            list.sort((a, b) => b.value - a.value);
        }
        return list;
    }
    getFromClientInfo(info) {
        for (const version of this._versions.values()) {
            if (version.value === info.clientVersion &&
                version.datSignature === info.datSignature &&
                version.sprSignature === info.sprSignature) {
                return version;
            }
        }
        return null;
    }
    getByValue(value) {
        const list = [];
        for (const version of this._versions.values()) {
            if (version.value === value) {
                list.push(version);
            }
        }
        return list;
    }
    getByValueString(value) {
        if (value) {
            const version = this._versions.get(value);
            if (version !== undefined) {
                return version;
            }
        }
        return null;
    }
    getBySignatures(datSignature, sprSignature) {
        for (const version of this._versions.values()) {
            if (version.sprSignature === sprSignature &&
                version.datSignature === datSignature) {
                return version;
            }
        }
        return null;
    }
    getByOtbVersion(otb) {
        const list = [];
        for (const version of this._versions.values()) {
            if (version.otbVersion === otb) {
                list.push(version);
            }
        }
        return list;
    }
    unload() {
        this._file = null;
        this._versions.clear();
        this._changed = false;
        this._loaded = false;
    }
}
exports.VersionStorage = VersionStorage;
VersionStorage._instance = null;

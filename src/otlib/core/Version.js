"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
class Version {
    constructor() {
        this.value = 0;
        this.valueStr = "";
        this.datSignature = 0;
        this.sprSignature = 0;
        this.otbVersion = 0;
    }
    toString() {
        return this.valueStr;
    }
    equals(version) {
        if (version &&
            version.value === this.value &&
            version.valueStr === this.valueStr &&
            version.datSignature === this.datSignature &&
            version.sprSignature === this.sprSignature &&
            version.otbVersion === this.otbVersion) {
            return true;
        }
        return false;
    }
    clone() {
        const version = new Version();
        version.value = this.value;
        version.valueStr = this.valueStr;
        version.datSignature = this.datSignature;
        version.sprSignature = this.sprSignature;
        version.otbVersion = this.otbVersion;
        return version;
    }
    serialize() {
        return {
            value: this.value,
            string: this.valueStr,
            dat: this.datSignature.toString(16).toUpperCase(),
            spr: this.sprSignature.toString(16).toUpperCase(),
            otb: this.otbVersion
        };
    }
    unserialize(xml) {
        if (!xml) {
            throw new Error("xml cannot be null");
        }
        if (xml.value === undefined) {
            throw new Error("Version.unserialize: Missing 'value' attribute.");
        }
        if (xml.string === undefined) {
            throw new Error("Version.unserialize: Missing 'string' attribute.");
        }
        if (xml.dat === undefined) {
            throw new Error("Version.unserialize: Missing 'dat' attribute.");
        }
        if (xml.spr === undefined) {
            throw new Error("Version.unserialize: Missing 'spr' attribute.");
        }
        if (xml.otb === undefined) {
            throw new Error("Version.unserialize: Missing 'otb' attribute.");
        }
        this.value = parseInt(xml.value, 10);
        this.valueStr = String(xml.string);
        this.datSignature = parseInt(`0x${xml.dat}`, 16);
        this.sprSignature = parseInt(`0x${xml.spr}`, 16);
        this.otbVersion = parseInt(xml.otb, 10);
    }
}
exports.Version = Version;

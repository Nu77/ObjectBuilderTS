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

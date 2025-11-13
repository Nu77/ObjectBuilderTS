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
exports.OTFI = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * OTFI (OT File Info) - Stores metadata about .dat and .spr files
 * Uses a simplified JSON format instead of OTML for now
 */
class OTFI {
    constructor(extended = false, transparency = false, improvedAnimations = false, frameGroups = false, metadataFile = null, spritesFile = null, spriteSize = 0, spriteDataSize = 0) {
        this.extended = false;
        this.transparency = false;
        this.improvedAnimations = false;
        this.frameGroups = false;
        this.metadataFile = null;
        this.spritesFile = null;
        this.spriteSize = 0;
        this.spriteDataSize = 0;
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
        this.metadataFile = metadataFile;
        this.spritesFile = spritesFile;
        this.spriteSize = spriteSize;
        this.spriteDataSize = spriteDataSize;
    }
    toString() {
        return `[OTFI extended=${this.extended}, transparency=${this.transparency}, ` +
            `improvedAnimations=${this.improvedAnimations}, frameGroups=${this.frameGroups}, ` +
            `spriteSize=${this.spriteSize}, spriteDataSize=${this.spriteDataSize}]`;
    }
    load(filePath) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        if (!fs.existsSync(filePath)) {
            return false;
        }
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== ".otfi") {
            return false;
        }
        try {
            // For now, use JSON format (can be enhanced to support OTML later)
            const content = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(content);
            if (!data.DatSpr) {
                return false;
            }
            const node = data.DatSpr;
            this.extended = node.extended || false;
            this.transparency = node.transparency || false;
            this.improvedAnimations = node["frame-durations"] || false;
            this.frameGroups = node["frame-groups"] || false;
            this.metadataFile = node["metadata-file"] || null;
            this.spritesFile = node["sprites-file"] || null;
            this.spriteSize = node["sprite-size"] || 0;
            this.spriteDataSize = node["sprite-data-size"] || 0;
            return true;
        }
        catch (error) {
            // Try to parse as OTML format (basic parsing)
            return this.loadOTML(filePath);
        }
    }
    loadOTML(filePath) {
        try {
            const content = fs.readFileSync(filePath, "utf8");
            // Basic OTML parsing - look for DatSpr section
            const datSprMatch = content.match(/DatSpr\s*\{([^}]+)\}/);
            if (!datSprMatch) {
                return false;
            }
            const datSprContent = datSprMatch[1];
            // Parse key-value pairs
            const parseValue = (key, defaultValue = false) => {
                const regex = new RegExp(`${key}\\s*=\\s*([^\\n]+)`, "i");
                const match = datSprContent.match(regex);
                if (!match)
                    return defaultValue;
                const value = match[1].trim();
                if (value === "true")
                    return true;
                if (value === "false")
                    return false;
                if (/^\d+$/.test(value))
                    return parseInt(value, 10);
                if (value.startsWith('"') && value.endsWith('"')) {
                    return value.slice(1, -1);
                }
                return value;
            };
            this.extended = parseValue("extended", false);
            this.transparency = parseValue("transparency", false);
            this.improvedAnimations = parseValue("frame-durations", false);
            this.frameGroups = parseValue("frame-groups", false);
            this.metadataFile = parseValue("metadata-file", null);
            this.spritesFile = parseValue("sprites-file", null);
            this.spriteSize = parseValue("sprite-size", 0);
            this.spriteDataSize = parseValue("sprite-data-size", 0);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    save(filePath) {
        if (!filePath) {
            throw new Error("file cannot be null");
        }
        try {
            // Check if it's a directory
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    return false;
                }
            }
            // Save as JSON format (can be enhanced to support OTML later)
            const data = {
                DatSpr: {
                    extended: this.extended,
                    transparency: this.transparency,
                    "frame-durations": this.improvedAnimations,
                    "frame-groups": this.frameGroups,
                    ...(this.metadataFile ? { "metadata-file": this.metadataFile } : {}),
                    ...(this.spritesFile ? { "sprites-file": this.spritesFile } : {}),
                    ...(this.spriteSize ? { "sprite-size": this.spriteSize } : {}),
                    ...(this.spriteDataSize ? { "sprite-data-size": this.spriteDataSize } : {})
                }
            };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.OTFI = OTFI;

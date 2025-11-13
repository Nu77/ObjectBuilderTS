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
exports.SettingsManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * SettingsManager - Manages loading and saving of settings files
 *
 * Note: Currently uses JSON format for simplicity. Full OTML support can be
 * added later by implementing OTMLDocument parsing/emitting.
 */
class SettingsManager {
    constructor() {
        if (SettingsManager._instance) {
            throw new Error("SettingsManager is a singleton class");
        }
        SettingsManager._instance = this;
        // Use OS-specific app data directory
        const appDataDir = os.homedir();
        const settingsDir = path.join(appDataDir, ".objectbuilder", "settings");
        // Create directory if it doesn't exist
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir, { recursive: true });
        }
        this._directory = settingsDir;
    }
    loadSettings(settings) {
        if (!settings) {
            throw new Error("settings cannot be null");
        }
        const type = settings.settingsClassType;
        const filePath = path.join(this._directory, `${type}.otcfg`);
        if (!fs.existsSync(filePath)) {
            return false;
        }
        try {
            // Try JSON format first (new format)
            const content = fs.readFileSync(filePath, "utf8");
            let data;
            // Check if it's JSON or OTML
            if (content.trim().startsWith("{")) {
                data = JSON.parse(content);
            }
            else {
                // TODO: Parse OTML format
                // For now, return false if it's not JSON
                console.warn("OTML format not yet fully supported, skipping:", filePath);
                return false;
            }
            return settings.unserialize(data);
        }
        catch (error) {
            console.error(`Failed to load settings from ${filePath}:`, error);
            return false;
        }
    }
    saveSettings(settings) {
        if (!settings) {
            throw new Error("settings cannot be null");
        }
        const type = settings.settingsClassType;
        const filePath = path.join(this._directory, `${type}.otcfg`);
        try {
            // Serialize settings to plain object
            const data = settings.serialize();
            // Save as JSON (can be enhanced to support OTML later)
            const json = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, json, "utf8");
            return true;
        }
        catch (error) {
            console.error(`Failed to save settings to ${filePath}:`, error);
            return false;
        }
    }
    static getInstance() {
        if (!SettingsManager._instance) {
            new SettingsManager();
        }
        return SettingsManager._instance;
    }
}
exports.SettingsManager = SettingsManager;
SettingsManager._instance = null;

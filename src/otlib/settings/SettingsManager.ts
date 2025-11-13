import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { ISettingsManager } from "./ISettingsManager";
import { ISettings } from "./ISettings";

/**
 * SettingsManager - Manages loading and saving of settings files
 * 
 * Note: Currently uses JSON format for simplicity. Full OTML support can be
 * added later by implementing OTMLDocument parsing/emitting.
 */
export class SettingsManager implements ISettingsManager {
    private static _instance: ISettingsManager | null = null;
    private _directory: string;

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

    public loadSettings(settings: ISettings): boolean {
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
            let data: any;

            // Check if it's JSON or OTML
            if (content.trim().startsWith("{")) {
                data = JSON.parse(content);
            } else {
                // TODO: Parse OTML format
                // For now, return false if it's not JSON
                console.warn("OTML format not yet fully supported, skipping:", filePath);
                return false;
            }

            return settings.unserialize(data);
        } catch (error: any) {
            console.error(`Failed to load settings from ${filePath}:`, error);
            return false;
        }
    }

    public saveSettings(settings: ISettings): boolean {
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
        } catch (error: any) {
            console.error(`Failed to save settings to ${filePath}:`, error);
            return false;
        }
    }

    public static getInstance(): ISettingsManager {
        if (!SettingsManager._instance) {
            new SettingsManager();
        }
        return SettingsManager._instance!;
    }
}


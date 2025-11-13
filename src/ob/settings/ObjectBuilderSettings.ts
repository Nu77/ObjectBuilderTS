import { ISettings } from "../../otlib/settings/ISettings";

export class ObjectBuilderSettings implements ISettings {
    // Application info
    public readonly settingsApplicationName: string = "ObjectBuilder";
    public readonly settingsApplicationVersion: string = "1.0.0";
    public readonly settingsClassType: string = "ObjectBuilderSettings";

    // List amounts
    public objectsListAmount: number = 100;
    public spritesListAmount: number = 100;
    
    // Auto-save settings
    public autosaveThingChanges: boolean = false;

    // Language settings
    private _language: string[] = ["en_US"];

    // Window state
    public maximized: boolean = false;
    public windowX: number = 0;
    public windowY: number = 0;
    public windowWidth: number = 1024;
    public windowHeight: number = 768;

    // Recent files (max 10)
    private _recentFiles: Array<{ datFile: string; sprFile: string; timestamp: number }> = [];

    // Default frame durations by category
    private _defaultDurations: Map<string, number> = new Map([
        ["item", 100],
        ["outfit", 100],
        ["effect", 100],
        ["missile", 100]
    ]);

    public getLanguage(): string[] {
        return this._language;
    }

    public setLanguage(language: string[]): void {
        this._language = language;
    }

    public getDefaultDuration(category: string): number {
        return this._defaultDurations.get(category.toLowerCase()) || 100;
    }

    public setDefaultDuration(category: string, duration: number): void {
        this._defaultDurations.set(category.toLowerCase(), duration);
    }

    public getRecentFiles(): Array<{ datFile: string; sprFile: string; timestamp: number }> {
        return this._recentFiles;
    }

    public addRecentFile(datFile: string, sprFile: string): void {
        // Remove existing entry if it exists
        this._recentFiles = this._recentFiles.filter(
            (f) => !(f.datFile === datFile && f.sprFile === sprFile)
        );
        
        // Add to beginning
        this._recentFiles.unshift({ datFile, sprFile, timestamp: Date.now() });
        
        // Keep only last 10
        if (this._recentFiles.length > 10) {
            this._recentFiles = this._recentFiles.slice(0, 10);
        }
    }

    public clearRecentFiles(): void {
        this._recentFiles = [];
    }

    // ISettings implementation
    public serialize(): any {
        return {
            settingsApplicationName: this.settingsApplicationName,
            settingsApplicationVersion: this.settingsApplicationVersion,
            settingsClassType: this.settingsClassType,
            objectsListAmount: this.objectsListAmount,
            spritesListAmount: this.spritesListAmount,
            autosaveThingChanges: this.autosaveThingChanges,
            language: this._language,
            maximized: this.maximized,
            windowX: this.windowX,
            windowY: this.windowY,
            windowWidth: this.windowWidth,
            windowHeight: this.windowHeight,
            defaultDurations: Object.fromEntries(this._defaultDurations),
            recentFiles: this._recentFiles
        };
    }

    public unserialize(data: any): boolean {
        if (!data) {
            return false;
        }

        try {
            if (data.objectsListAmount !== undefined) {
                this.objectsListAmount = data.objectsListAmount;
            }
            if (data.spritesListAmount !== undefined) {
                this.spritesListAmount = data.spritesListAmount;
            }
            if (data.autosaveThingChanges !== undefined) {
                this.autosaveThingChanges = data.autosaveThingChanges;
            }
            if (data.language !== undefined) {
                this._language = Array.isArray(data.language) ? data.language : [data.language];
            }
            if (data.maximized !== undefined) {
                this.maximized = data.maximized;
            }
            if (data.windowX !== undefined) {
                this.windowX = data.windowX;
            }
            if (data.windowY !== undefined) {
                this.windowY = data.windowY;
            }
            if (data.windowWidth !== undefined) {
                this.windowWidth = data.windowWidth;
            }
            if (data.windowHeight !== undefined) {
                this.windowHeight = data.windowHeight;
            }
            if (data.defaultDurations !== undefined) {
                this._defaultDurations = new Map(Object.entries(data.defaultDurations));
            }
            if (data.recentFiles !== undefined && Array.isArray(data.recentFiles)) {
                this._recentFiles = data.recentFiles;
            }

            return true;
        } catch (error) {
            console.error("Failed to unserialize ObjectBuilderSettings:", error);
            return false;
        }
    }
}


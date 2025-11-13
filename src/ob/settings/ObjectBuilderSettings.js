"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectBuilderSettings = void 0;
class ObjectBuilderSettings {
    constructor() {
        // Application info
        this.settingsApplicationName = "ObjectBuilder";
        this.settingsApplicationVersion = "1.0.0";
        this.settingsClassType = "ObjectBuilderSettings";
        // List amounts
        this.objectsListAmount = 100;
        this.spritesListAmount = 100;
        // Language settings
        this._language = ["en_US"];
        // Window state
        this.maximized = false;
        this.windowX = 0;
        this.windowY = 0;
        this.windowWidth = 1024;
        this.windowHeight = 768;
        // Default frame durations by category
        this._defaultDurations = new Map([
            ["item", 100],
            ["outfit", 100],
            ["effect", 100],
            ["missile", 100]
        ]);
    }
    getLanguage() {
        return this._language;
    }
    setLanguage(language) {
        this._language = language;
    }
    getDefaultDuration(category) {
        return this._defaultDurations.get(category.toLowerCase()) || 100;
    }
    setDefaultDuration(category, duration) {
        this._defaultDurations.set(category.toLowerCase(), duration);
    }
    // ISettings implementation
    serialize() {
        return {
            settingsApplicationName: this.settingsApplicationName,
            settingsApplicationVersion: this.settingsApplicationVersion,
            settingsClassType: this.settingsClassType,
            objectsListAmount: this.objectsListAmount,
            spritesListAmount: this.spritesListAmount,
            language: this._language,
            maximized: this.maximized,
            windowX: this.windowX,
            windowY: this.windowY,
            windowWidth: this.windowWidth,
            windowHeight: this.windowHeight,
            defaultDurations: Object.fromEntries(this._defaultDurations)
        };
    }
    unserialize(data) {
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
            return true;
        }
        catch (error) {
            console.error("Failed to unserialize ObjectBuilderSettings:", error);
            return false;
        }
    }
}
exports.ObjectBuilderSettings = ObjectBuilderSettings;

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

import { ISettings } from "../../otlib/settings/ISettings";

export class ObjectBuilderSettings implements ISettings {
    // Application info
    public readonly settingsApplicationName: string = "ObjectBuilder";
    public readonly settingsApplicationVersion: string = "1.0.0";
    public readonly settingsClassType: string = "ObjectBuilderSettings";

    // List amounts
    public objectsListAmount: number = 100;
    public spritesListAmount: number = 100;

    // Language settings
    private _language: string[] = ["en_US"];

    // Window state
    public maximized: boolean = false;
    public windowX: number = 0;
    public windowY: number = 0;
    public windowWidth: number = 1024;
    public windowHeight: number = 768;

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

    // ISettings implementation
    public serialize(): any {
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
        } catch (error) {
            console.error("Failed to unserialize ObjectBuilderSettings:", error);
            return false;
        }
    }
}


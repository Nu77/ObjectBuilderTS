import { ISettings } from "./ISettings";

export interface ISettingsManager {
    loadSettings(settings: ISettings): boolean;
    saveSettings(settings: ISettings): boolean;
}


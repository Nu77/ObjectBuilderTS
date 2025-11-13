/**
 * Interface for settings classes
 * Note: Full OTML support can be added later
 */
export interface ISettings {
    readonly settingsApplicationName: string;
    readonly settingsApplicationVersion: string;
    readonly settingsClassType: string;

    serialize(): any; // Returns a plain object for JSON serialization
    unserialize(data: any): boolean; // Takes a plain object from JSON
}


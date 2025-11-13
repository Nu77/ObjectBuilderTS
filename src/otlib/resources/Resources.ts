export interface IResourceManager {
    getString(bundleName: string, resourceName: string, parameters?: any[] | null, locale?: string): string;
}

export class Resources {
    public static manager: IResourceManager | null = null;
    public static bundleName: string = "strings";
    public static locale: string = "en_US";

    private constructor() {
        throw new Error("Resources is a static class and cannot be instantiated");
    }

    public static getString(resourceName: string, ...rest: any[]): string {
        if (!Resources.manager) {
            throw new Error("Resource manager not initialized");
        }

        const parameters = rest.length === 0 ? null : rest;
        return Resources.manager.getString(Resources.bundleName, resourceName, parameters, Resources.locale);
    }
}


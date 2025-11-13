"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Resources = void 0;
class Resources {
    constructor() {
        throw new Error("Resources is a static class and cannot be instantiated");
    }
    static getString(resourceName, ...rest) {
        if (!Resources.manager) {
            throw new Error("Resource manager not initialized");
        }
        const parameters = rest.length === 0 ? null : rest;
        return Resources.manager.getString(Resources.bundleName, resourceName, parameters, Resources.locale);
    }
}
exports.Resources = Resources;
Resources.manager = null;
Resources.bundleName = "strings";
Resources.locale = "en_US";

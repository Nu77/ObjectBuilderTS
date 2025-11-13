"use strict";
/*
*  SaveHelper utility for saving files with progress tracking
*  Replaces Flash's SaveHelper
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
exports.SaveHelper = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const ProgressEvent_1 = require("../../otlib/events/ProgressEvent");
const ProgressBarID_1 = require("../commands/ProgressBarID");
class SaveHelper extends events_1.EventEmitter {
    constructor() {
        super();
        this._files = [];
    }
    addFile(data, name, format, filePath) {
        this._files.push({
            data,
            name,
            format,
            filePath
        });
    }
    async save() {
        const total = this._files.length;
        let saved = 0;
        for (const file of this._files) {
            try {
                // Ensure directory exists
                const dir = path.dirname(file.filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Write file
                if (typeof file.data === "string") {
                    fs.writeFileSync(file.filePath, file.data, "utf8");
                }
                else {
                    fs.writeFileSync(file.filePath, file.data);
                }
                saved++;
                this.emit("progress", new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, saved, total));
            }
            catch (error) {
                this.emit("error", new Error(`Failed to save ${file.filePath}: ${error.message}`));
            }
        }
        this.emit("complete");
    }
}
exports.SaveHelper = SaveHelper;

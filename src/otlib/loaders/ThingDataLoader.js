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
exports.ThingDataLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const ProgressEvent_1 = require("../events/ProgressEvent");
const ProgressBarID_1 = require("../../ob/commands/ProgressBarID");
const OTFormat_1 = require("../utils/OTFormat");
const OBDEncoder_1 = require("../obd/OBDEncoder");
const ByteArray_1 = require("../utils/ByteArray");
class ThingDataLoader extends events_1.EventEmitter {
    get thingDataList() { return this._thingDataList; }
    get length() { return this._files ? this._files.length : 0; }
    constructor(settings) {
        super();
        this._thingDataList = [];
        this._files = [];
        this._index = -1;
        this._encoder = new OBDEncoder_1.OBDEncoder(settings);
    }
    load(file) {
        if (!file) {
            throw new Error("file cannot be null");
        }
        this.onLoad([file]);
    }
    loadFiles(files) {
        if (!files) {
            throw new Error("files cannot be null");
        }
        if (files.length > 0) {
            this.onLoad(files);
        }
    }
    onLoad(files) {
        this._files = files;
        this._thingDataList = [];
        this._index = -1;
        this.loadNext();
    }
    loadNext() {
        this._index++;
        this.emit(ProgressEvent_1.ProgressEvent.PROGRESS, new ProgressEvent_1.ProgressEvent(ProgressEvent_1.ProgressEvent.PROGRESS, ProgressBarID_1.ProgressBarID.DEFAULT, this._index, this._files.length));
        if (this._index >= this._files.length) {
            this.emit("complete");
            return;
        }
        const filePath = this._files[this._index].nativePath;
        const ext = path.extname(filePath).toLowerCase().substring(1);
        if (ext === OTFormat_1.OTFormat.OBD) {
            this.loadOBD(filePath, this._files[this._index].id);
        }
        else {
            this.loadNext();
        }
    }
    async loadOBD(filePath, id) {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const byteArray = ByteArray_1.ByteArray.fromBuffer(fileBuffer);
            const thingData = await this._encoder.decode(byteArray);
            if (thingData.thing) {
                thingData.thing.id = id;
            }
            this._thingDataList.push(thingData);
            this.loadNext();
        }
        catch (error) {
            this._thingDataList = [];
            this.emit("error", new Error(error.message || error));
        }
    }
}
exports.ThingDataLoader = ThingDataLoader;

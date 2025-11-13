import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import { PathHelper } from "./PathHelper";
import { ThingData } from "../things/ThingData";
import { ProgressEvent } from "../events/ProgressEvent";
import { ProgressBarID } from "../../ob/commands/ProgressBarID";
import { OTFormat } from "../utils/OTFormat";
import { ObjectBuilderSettings } from "../../ob/settings/ObjectBuilderSettings";
import { OBDEncoder } from "../obd/OBDEncoder";
import { ByteArray } from "../utils/ByteArray";

export class ThingDataLoader extends EventEmitter {
    private _encoder: OBDEncoder;
    private _thingDataList: ThingData[] = [];
    private _files: PathHelper[] = [];
    private _index: number = -1;

    public get thingDataList(): ThingData[] { return this._thingDataList; }
    public get length(): number { return this._files ? this._files.length : 0; }

    constructor(settings: ObjectBuilderSettings) {
        super();
        this._encoder = new OBDEncoder(settings);
    }

    public load(file: PathHelper): void {
        if (!file) {
            throw new Error("file cannot be null");
        }
        this.onLoad([file]);
    }

    public loadFiles(files: PathHelper[]): void {
        if (!files) {
            throw new Error("files cannot be null");
        }

        if (files.length > 0) {
            this.onLoad(files);
        }
    }

    private onLoad(files: PathHelper[]): void {
        this._files = files;
        this._thingDataList = [];
        this._index = -1;
        this.loadNext();
    }

    private loadNext(): void {
        this._index++;

        this.emit(ProgressEvent.PROGRESS, new ProgressEvent(ProgressEvent.PROGRESS, ProgressBarID.DEFAULT, this._index, this._files.length));

        if (this._index >= this._files.length) {
            this.emit("complete");
            return;
        }

        const filePath = this._files[this._index].nativePath;
        const ext = path.extname(filePath).toLowerCase().substring(1);

        if (ext === OTFormat.OBD) {
            this.loadOBD(filePath, this._files[this._index].id);
        } else {
            this.loadNext();
        }
    }

    private async loadOBD(filePath: string, id: number): Promise<void> {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const byteArray = ByteArray.fromBuffer(fileBuffer);
            const thingData = await this._encoder.decode(byteArray);
            if (thingData.thing) {
                thingData.thing.id = id;
            }
            this._thingDataList.push(thingData);
            this.loadNext();
        } catch (error: any) {
            this._thingDataList = [];
            this.emit("error", new Error(error.message || error));
        }
    }
}


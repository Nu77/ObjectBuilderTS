/*
*  SaveHelper utility for saving files with progress tracking
*  Replaces Flash's SaveHelper
*/

import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import { ProgressEvent } from "../../otlib/events/ProgressEvent";
import { ProgressBarID } from "../commands/ProgressBarID";

interface FileEntry {
    data: Buffer | string;
    name: string;
    format: string;
    filePath: string;
}

export class SaveHelper extends EventEmitter {
    private _files: FileEntry[] = [];

    constructor() {
        super();
    }

    public addFile(data: Buffer | string, name: string, format: string, filePath: string): void {
        this._files.push({
            data,
            name,
            format,
            filePath
        });
    }

    public async save(): Promise<void> {
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
                } else {
                    fs.writeFileSync(file.filePath, file.data);
                }

                saved++;
                this.emit("progress", new ProgressEvent(
                    ProgressEvent.PROGRESS,
                    ProgressBarID.DEFAULT,
                    saved,
                    total
                ));
            } catch (error: any) {
                this.emit("error", new Error(`Failed to save ${file.filePath}: ${error.message}`));
            }
        }

        this.emit("complete");
    }
}


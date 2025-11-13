import { WorkerCommand } from "../../../workers/WorkerCommand";
import { Version } from "../../../otlib/core/Version";
import { PathHelper } from "../../../otlib/loaders/PathHelper";

export class ExportThingCommand extends WorkerCommand {
    public list: PathHelper[];
    public category: string;
    public obdVersion: number;
    public clientVersion: Version;
    public spriteSheetFlag: number;
    public transparentBackground: boolean;
    public jpegQuality: number;

    constructor(list: PathHelper[],
                category: string,
                obdVersion: number,
                clientVersion: Version,
                spriteSheetFlag: number,
                transparentBackground: boolean,
                jpegQuality: number) {
        super();
        this.list = list;
        this.category = category;
        this.obdVersion = obdVersion;
        this.clientVersion = clientVersion;
        this.spriteSheetFlag = spriteSheetFlag;
        this.transparentBackground = transparentBackground;
        this.jpegQuality = jpegQuality;
    }
}


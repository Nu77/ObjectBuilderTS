import { WorkerCommand } from "../../../workers/WorkerCommand";
import { Version } from "../../../otlib/core/Version";

export class LoadFilesCommand extends WorkerCommand {
    public datFile: string;
    public sprFile: string;
    public version: Version | null;
    public extended: boolean;
    public transparency: boolean;
    public improvedAnimations: boolean;
    public frameGroups: boolean;

    constructor(datFile: string,
                sprFile: string,
                version: Version | null,
                extended: boolean,
                transparency: boolean,
                improvedAnimations: boolean,
                frameGroups: boolean) {
        super();
        this.datFile = datFile;
        this.sprFile = sprFile;
        this.version = version;
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}


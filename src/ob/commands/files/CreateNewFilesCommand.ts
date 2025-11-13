import { WorkerCommand } from "../../../workers/WorkerCommand";

export class CreateNewFilesCommand extends WorkerCommand {
    public datSignature: number;
    public sprSignature: number;
    public extended: boolean;
    public transparency: boolean;
    public improvedAnimations: boolean;
    public frameGroups: boolean;

    constructor(datSignature: number,
                sprSignature: number,
                extended: boolean,
                transparency: boolean,
                improvedAnimations: boolean,
                frameGroups: boolean) {
        super();
        this.datSignature = datSignature;
        this.sprSignature = sprSignature;
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}


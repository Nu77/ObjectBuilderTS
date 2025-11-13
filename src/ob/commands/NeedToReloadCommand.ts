import { WorkerCommand } from "../../workers/WorkerCommand";

export class NeedToReloadCommand extends WorkerCommand {
    public extended: boolean;
    public transparency: boolean;
    public improvedAnimations: boolean;
    public frameGroups: boolean;

    constructor(extended: boolean, transparency: boolean, improvedAnimations: boolean, frameGroups: boolean) {
        super();
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}


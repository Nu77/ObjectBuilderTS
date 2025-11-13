import { WorkerCommand } from "../../../workers/WorkerCommand";

export class FindSpritesCommand extends WorkerCommand {
    public unusedSprites: boolean;
    public emptySprites: boolean;

    constructor(unusedSprites: boolean, emptySprites: boolean) {
        super();
        this.unusedSprites = unusedSprites;
        this.emptySprites = emptySprites;
    }
}


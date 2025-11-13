import { WorkerCommand } from "../../../workers/WorkerCommand";
import { SpriteData } from "../../../otlib/sprites/SpriteData";

export class ReplaceSpritesCommand extends WorkerCommand {
    public list: SpriteData[];

    constructor(list: SpriteData[]) {
        super();
        this.list = list;
    }
}


import { WorkerCommand } from "../../../workers/WorkerCommand";
import { SpriteData } from "../../../otlib/sprites/SpriteData";

export class SetSpriteListCommand extends WorkerCommand {
    public selectedIds: number[];
    public sprites: SpriteData[];

    constructor(selectedIds: number[], sprites: SpriteData[]) {
        super();
        this.selectedIds = selectedIds;
        this.sprites = sprites;
    }
}


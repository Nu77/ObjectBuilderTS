import { WorkerCommand } from "../../../workers/WorkerCommand";
import { Buffer } from "buffer";

export class ImportSpritesCommand extends WorkerCommand {
    public sprites: Buffer[];

    constructor(sprites: Buffer[]) {
        super();
        this.sprites = sprites;
    }
}


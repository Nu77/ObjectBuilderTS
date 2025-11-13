import { WorkerCommand } from "../../../workers/WorkerCommand";
import { PathHelper } from "../../../otlib/loaders/PathHelper";

export class ExportSpritesCommand extends WorkerCommand {
    public list: PathHelper[];
    public transparentBackground: boolean;
    public jpegQuality: number;

    constructor(list: PathHelper[],
                transparentBackground: boolean,
                jpegQuality: number) {
        super();
        this.list = list;
        this.transparentBackground = transparentBackground;
        this.jpegQuality = jpegQuality;
    }
}


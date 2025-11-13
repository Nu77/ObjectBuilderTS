"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSpritesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ImportSpritesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(sprites) {
        super();
        this.sprites = sprites;
    }
}
exports.ImportSpritesCommand = ImportSpritesCommand;

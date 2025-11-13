"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.FindSpritesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class FindSpritesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(unusedSprites, emptySprites) {
        super();
        this.unusedSprites = unusedSprites;
        this.emptySprites = emptySprites;
    }
}
exports.FindSpritesCommand = FindSpritesCommand;

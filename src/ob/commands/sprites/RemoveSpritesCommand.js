"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveSpritesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class RemoveSpritesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.RemoveSpritesCommand = RemoveSpritesCommand;

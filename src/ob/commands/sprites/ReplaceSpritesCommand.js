"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceSpritesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ReplaceSpritesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ReplaceSpritesCommand = ReplaceSpritesCommand;

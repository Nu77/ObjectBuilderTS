"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.FindResultCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class FindResultCommand extends WorkerCommand_1.WorkerCommand {
    constructor(type, list) {
        super();
        this.type = type;
        this.list = list;
    }
}
exports.FindResultCommand = FindResultCommand;
FindResultCommand.THINGS = 1;
FindResultCommand.SPRITES = 2;

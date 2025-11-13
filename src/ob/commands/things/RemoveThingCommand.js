"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class RemoveThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list, category, removeSprites) {
        super();
        this.list = list;
        this.category = category;
        this.removeSprites = removeSprites;
    }
}
exports.RemoveThingCommand = RemoveThingCommand;

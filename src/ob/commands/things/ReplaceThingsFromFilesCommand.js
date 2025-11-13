"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceThingsFromFilesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ReplaceThingsFromFilesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ReplaceThingsFromFilesCommand = ReplaceThingsFromFilesCommand;

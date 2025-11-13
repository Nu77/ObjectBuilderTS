"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceThingsCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ReplaceThingsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ReplaceThingsCommand = ReplaceThingsCommand;

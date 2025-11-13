"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportThingsCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ImportThingsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ImportThingsCommand = ImportThingsCommand;

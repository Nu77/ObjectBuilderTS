"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportThingsFromFilesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ImportThingsFromFilesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ImportThingsFromFilesCommand = ImportThingsFromFilesCommand;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSpritesFromFileCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ImportSpritesFromFileCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list) {
        super();
        this.list = list;
    }
}
exports.ImportSpritesFromFileCommand = ImportSpritesFromFileCommand;

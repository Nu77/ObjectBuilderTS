"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceSpritesFromFilesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ReplaceSpritesFromFilesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(files) {
        super();
        this.files = files;
    }
}
exports.ReplaceSpritesFromFilesCommand = ReplaceSpritesFromFilesCommand;

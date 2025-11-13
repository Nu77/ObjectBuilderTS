"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadSpriteDimensionsCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class LoadSpriteDimensionsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(file) {
        super();
        this.file = file;
    }
}
exports.LoadSpriteDimensionsCommand = LoadSpriteDimensionsCommand;

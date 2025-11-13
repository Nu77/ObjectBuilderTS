"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadVersionsCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class LoadVersionsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(path) {
        super(path);
        this.path = path;
    }
}
exports.LoadVersionsCommand = LoadVersionsCommand;

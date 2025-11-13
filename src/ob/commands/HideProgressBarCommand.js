"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HideProgressBarCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class HideProgressBarCommand extends WorkerCommand_1.WorkerCommand {
    constructor(id) {
        super(id);
        this.id = id;
    }
}
exports.HideProgressBarCommand = HideProgressBarCommand;

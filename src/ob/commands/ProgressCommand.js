"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class ProgressCommand extends WorkerCommand_1.WorkerCommand {
    constructor(id, value, total, label = "") {
        super({ id, value, total, label });
        this.id = id;
        this.value = value;
        this.total = total;
        this.label = label;
    }
}
exports.ProgressCommand = ProgressCommand;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetClientInfoCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class SetClientInfoCommand extends WorkerCommand_1.WorkerCommand {
    constructor(info) {
        super(info);
        this.info = info;
    }
}
exports.SetClientInfoCommand = SetClientInfoCommand;

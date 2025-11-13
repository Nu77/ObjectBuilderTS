"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSpriteDimensionCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class SetSpriteDimensionCommand extends WorkerCommand_1.WorkerCommand {
    constructor(value, size, dataSize) {
        super();
        this.value = value;
        this.size = size;
        this.dataSize = dataSize;
    }
}
exports.SetSpriteDimensionCommand = SetSpriteDimensionCommand;

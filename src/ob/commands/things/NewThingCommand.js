"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NewThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class NewThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(category) {
        super();
        this.category = category;
    }
}
exports.NewThingCommand = NewThingCommand;

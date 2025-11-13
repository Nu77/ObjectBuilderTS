"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GetThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class GetThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(id, category) {
        super();
        this.id = id;
        this.category = category;
    }
}
exports.GetThingCommand = GetThingCommand;

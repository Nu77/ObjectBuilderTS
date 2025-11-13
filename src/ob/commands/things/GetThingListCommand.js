"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GetThingListCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class GetThingListCommand extends WorkerCommand_1.WorkerCommand {
    constructor(targetId, category) {
        super();
        this.targetId = targetId;
        this.category = category;
    }
}
exports.GetThingListCommand = GetThingListCommand;

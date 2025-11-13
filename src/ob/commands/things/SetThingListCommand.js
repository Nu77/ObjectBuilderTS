"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetThingListCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class SetThingListCommand extends WorkerCommand_1.WorkerCommand {
    constructor(selectedIds, things) {
        super();
        this.selectedIds = selectedIds;
        this.things = things;
    }
}
exports.SetThingListCommand = SetThingListCommand;

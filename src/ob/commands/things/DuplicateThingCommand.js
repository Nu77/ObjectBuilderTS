"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class DuplicateThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(ids, category) {
        super();
        this.ids = ids;
        this.category = category;
    }
}
exports.DuplicateThingCommand = DuplicateThingCommand;

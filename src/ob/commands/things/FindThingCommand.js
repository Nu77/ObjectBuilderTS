"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.FindThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class FindThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(category, properties) {
        super();
        this.category = category;
        this.properties = properties;
    }
}
exports.FindThingCommand = FindThingCommand;

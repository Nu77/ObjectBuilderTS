"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetThingDataCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class SetThingDataCommand extends WorkerCommand_1.WorkerCommand {
    constructor(thingData) {
        super();
        this.thingData = thingData;
    }
}
exports.SetThingDataCommand = SetThingDataCommand;

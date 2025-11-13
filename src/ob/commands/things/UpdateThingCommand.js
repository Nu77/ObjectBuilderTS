"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class UpdateThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(thingData, replaceSprites) {
        super();
        this.thingData = thingData;
        this.replaceSprites = replaceSprites;
    }
}
exports.UpdateThingCommand = UpdateThingCommand;

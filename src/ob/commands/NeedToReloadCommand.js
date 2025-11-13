"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NeedToReloadCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class NeedToReloadCommand extends WorkerCommand_1.WorkerCommand {
    constructor(extended, transparency, improvedAnimations, frameGroups) {
        super();
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}
exports.NeedToReloadCommand = NeedToReloadCommand;

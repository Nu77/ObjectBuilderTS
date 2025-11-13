"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewFilesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class CreateNewFilesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(datSignature, sprSignature, extended, transparency, improvedAnimations, frameGroups) {
        super();
        this.datSignature = datSignature;
        this.sprSignature = sprSignature;
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}
exports.CreateNewFilesCommand = CreateNewFilesCommand;

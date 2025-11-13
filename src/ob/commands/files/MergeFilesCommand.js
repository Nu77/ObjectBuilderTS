"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeFilesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class MergeFilesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(datFile, sprFile, version, extended, transparency, improvedAnimations, frameGroups) {
        super();
        this.datFile = datFile;
        this.sprFile = sprFile;
        this.version = version;
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
    }
}
exports.MergeFilesCommand = MergeFilesCommand;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertFrameGroupsCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ConvertFrameGroupsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(frameGroups, mounts) {
        super();
        this.frameGroups = frameGroups;
        this.mounts = mounts;
    }
}
exports.ConvertFrameGroupsCommand = ConvertFrameGroupsCommand;

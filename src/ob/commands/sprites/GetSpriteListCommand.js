"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpriteListCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class GetSpriteListCommand extends WorkerCommand_1.WorkerCommand {
    constructor(targetId) {
        super();
        this.targetId = targetId;
    }
}
exports.GetSpriteListCommand = GetSpriteListCommand;

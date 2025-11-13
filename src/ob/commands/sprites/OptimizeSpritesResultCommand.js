"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizeSpritesResultCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class OptimizeSpritesResultCommand extends WorkerCommand_1.WorkerCommand {
    constructor(removed, oldCount, newCount) {
        super();
        this.removed = removed;
        this.oldCount = oldCount;
        this.newCount = newCount;
    }
}
exports.OptimizeSpritesResultCommand = OptimizeSpritesResultCommand;

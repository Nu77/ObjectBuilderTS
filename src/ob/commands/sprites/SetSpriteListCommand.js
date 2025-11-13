"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSpriteListCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class SetSpriteListCommand extends WorkerCommand_1.WorkerCommand {
    constructor(selectedIds, sprites) {
        super();
        this.selectedIds = selectedIds;
        this.sprites = sprites;
    }
}
exports.SetSpriteListCommand = SetSpriteListCommand;

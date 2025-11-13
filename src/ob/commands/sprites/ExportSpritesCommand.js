"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportSpritesCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ExportSpritesCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list, transparentBackground, jpegQuality) {
        super();
        this.list = list;
        this.transparentBackground = transparentBackground;
        this.jpegQuality = jpegQuality;
    }
}
exports.ExportSpritesCommand = ExportSpritesCommand;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportThingCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class ExportThingCommand extends WorkerCommand_1.WorkerCommand {
    constructor(list, category, obdVersion, clientVersion, spriteSheetFlag, transparentBackground, jpegQuality) {
        super();
        this.list = list;
        this.category = category;
        this.obdVersion = obdVersion;
        this.clientVersion = clientVersion;
        this.spriteSheetFlag = spriteSheetFlag;
        this.transparentBackground = transparentBackground;
        this.jpegQuality = jpegQuality;
    }
}
exports.ExportThingCommand = ExportThingCommand;

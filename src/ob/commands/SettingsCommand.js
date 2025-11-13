"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsCommand = void 0;
const WorkerCommand_1 = require("../../workers/WorkerCommand");
class SettingsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(settings) {
        super(settings);
        this.settings = settings;
    }
}
exports.SettingsCommand = SettingsCommand;

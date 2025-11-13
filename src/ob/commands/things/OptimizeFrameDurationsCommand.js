"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizeFrameDurationsCommand = void 0;
const WorkerCommand_1 = require("../../../workers/WorkerCommand");
class OptimizeFrameDurationsCommand extends WorkerCommand_1.WorkerCommand {
    constructor(items, itemsMinimumDuration, itemsMaximumDuration, outfits, outfitsMinimumDuration, outfitsMaximumDuration, effects, effectsMinimumDuration, effectsMaximumDuration) {
        super();
        this.items = items;
        this.itemsMinimumDuration = itemsMinimumDuration;
        this.itemsMaximumDuration = itemsMaximumDuration;
        this.outfits = outfits;
        this.outfitsMinimumDuration = outfitsMinimumDuration;
        this.outfitsMaximumDuration = outfitsMaximumDuration;
        this.effects = effects;
        this.effectsMinimumDuration = effectsMinimumDuration;
        this.effectsMaximumDuration = effectsMaximumDuration;
    }
}
exports.OptimizeFrameDurationsCommand = OptimizeFrameDurationsCommand;

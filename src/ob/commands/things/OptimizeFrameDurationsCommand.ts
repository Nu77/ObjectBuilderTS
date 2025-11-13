import { WorkerCommand } from "../../../workers/WorkerCommand";

export class OptimizeFrameDurationsCommand extends WorkerCommand {
    public items: boolean;
    public itemsMinimumDuration: number;
    public itemsMaximumDuration: number;
    public outfits: boolean;
    public outfitsMinimumDuration: number;
    public outfitsMaximumDuration: number;
    public effects: boolean;
    public effectsMinimumDuration: number;
    public effectsMaximumDuration: number;

    constructor(items: boolean, itemsMinimumDuration: number, itemsMaximumDuration: number,
                outfits: boolean, outfitsMinimumDuration: number, outfitsMaximumDuration: number,
                effects: boolean, effectsMinimumDuration: number, effectsMaximumDuration: number) {
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


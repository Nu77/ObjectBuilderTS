import { WorkerCommand } from "../../workers/WorkerCommand";
import { ObjectBuilderSettings } from "../settings/ObjectBuilderSettings";

export class SettingsCommand extends WorkerCommand {
    public settings: ObjectBuilderSettings;

    constructor(settings: ObjectBuilderSettings) {
        super(settings);
        this.settings = settings;
    }
}


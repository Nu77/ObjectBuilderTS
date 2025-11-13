import { WorkerCommand } from "../../workers/WorkerCommand";

export enum LogLevel {
    DEBUG = 2,
    INFO = 4,
    WARN = 6,
    ERROR = 8,
    FATAL = 1000
}

export class LogCommand extends WorkerCommand {
    public level: LogLevel;
    public message: string;
    public stack?: string;
    public source?: string;
    public timestamp: number;

    constructor(level: LogLevel, message: string, stack?: string, source?: string) {
        super({ level, message, stack, source, timestamp: Date.now() });
        this.level = level;
        this.message = message;
        this.stack = stack;
        this.source = source;
        this.timestamp = Date.now();
    }
}


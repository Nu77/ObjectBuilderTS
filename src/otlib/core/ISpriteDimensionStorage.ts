import { EventEmitter } from "events";
import { SpriteDimension } from "./SpriteDimension";
import { ClientInfo } from "../utils/ClientInfo";

export interface ISpriteDimensionStorage extends EventEmitter {
    readonly file: string | null;
    readonly changed: boolean;
    readonly loaded: boolean;

    load(file: string): boolean;
    getList(): SpriteDimension[];
    getBySizes(size: number, dataSize: number): SpriteDimension | null;
    getFromClientInfo(info: ClientInfo): SpriteDimension | null;
    unload(): void;
}


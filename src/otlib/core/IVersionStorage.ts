import { EventEmitter } from "events";
import { Version } from "./Version";
import { ClientInfo } from "../utils/ClientInfo";

export interface IVersionStorage extends EventEmitter {
    readonly file: string | null;
    readonly changed: boolean;
    readonly loaded: boolean;

    load(file: string): boolean;
    addVersion(value: number, dat: number, spr: number, otb: number): Version;
    removeVersion(version: Version): Version | null;
    save(file: string): void;
    getList(): Version[];
    getFromClientInfo(info: ClientInfo): Version | null;
    getByValue(value: number): Version[];
    getByValueString(value: string): Version | null;
    getBySignatures(datSignature: number, sprSignature: number): Version | null;
    getByOtbVersion(otb: number): Version[];
    unload(): void;
}


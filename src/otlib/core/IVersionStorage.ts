/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

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


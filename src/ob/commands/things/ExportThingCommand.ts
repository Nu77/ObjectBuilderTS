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

import { WorkerCommand } from "../../../workers/WorkerCommand";
import { Version } from "../../../otlib/core/Version";
import { PathHelper } from "../../../otlib/loaders/PathHelper";

export class ExportThingCommand extends WorkerCommand {
    public list: PathHelper[];
    public category: string;
    public obdVersion: number;
    public clientVersion: Version;
    public spriteSheetFlag: number;
    public transparentBackground: boolean;
    public jpegQuality: number;

    constructor(list: PathHelper[],
                category: string,
                obdVersion: number,
                clientVersion: Version,
                spriteSheetFlag: number,
                transparentBackground: boolean,
                jpegQuality: number) {
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


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

import { ObjectBuilderSettings } from "../settings/ObjectBuilderSettings";
import { IVersionStorage } from "../../otlib/core/IVersionStorage";
import { Version } from "../../otlib/core/Version";
import { ClientInfo } from "../../otlib/utils/ClientInfo";

export interface IObjectBuilder {
    readonly locked: boolean;

    readonly settings: ObjectBuilderSettings;
    readonly versionStorage: IVersionStorage;
    readonly version: Version;

    showPreviewPanel: boolean;
    showThingsPanel: boolean;
    showSpritesPanel: boolean;

    readonly clientInfo: ClientInfo;
    readonly clientExtendedEnabled: boolean;
    readonly clientTransparencyEnabled: boolean;
    readonly clientChanged: boolean;
    readonly clientIsTemporary: boolean;
    readonly clientLoaded: boolean;

    createNewProject(): void;
    openProject(directory?: string | null): void;
    compileProject(): void;
    compileProjectAs(): void;
    unloadProject(): void;

    openPreferencesWindow(): void;

    openFinder(): void;
    closeFinder(): void;

    openObjectViewer(file?: string | null): void;
    closeObjectViewer(): void;

    openSlicer(file?: string | null): void;
    closeSlicer(): void;

    openAnimationEditor(): void;
    closeAnimationEditor(): void;

    openAssetStore(): void;
    closeAssetStore(): void;

    openSpritesOptimizer(): void;

    openLogWindow(): void;
    closeLogWindow(): void;
}


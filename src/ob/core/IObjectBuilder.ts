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


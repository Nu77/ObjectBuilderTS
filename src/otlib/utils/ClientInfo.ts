export class ClientInfo {
    public clientVersion: number = 0;
    public clientVersionStr: string = "";
    public datSignature: number = 0;
    public minItemId: number = 0;
    public maxItemId: number = 0;
    public minOutfitId: number = 0;
    public maxOutfitId: number = 0;
    public minEffectId: number = 0;
    public maxEffectId: number = 0;
    public minMissileId: number = 0;
    public maxMissileId: number = 0;
    public sprSignature: number = 0;
    public minSpriteId: number = 0;
    public maxSpriteId: number = 0;
    public extended: boolean = false;
    public transparency: boolean = false;
    public improvedAnimations: boolean = false;
    public frameGroups: boolean = false;
    public changed: boolean = false;
    public isTemporary: boolean = false;
    public loaded: boolean = false;
    public spriteSize: number = 0;
    public spriteDataSize: number = 0;

    constructor() {
    }
}


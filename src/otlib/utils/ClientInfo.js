"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInfo = void 0;
class ClientInfo {
    constructor() {
        this.clientVersion = 0;
        this.clientVersionStr = "";
        this.datSignature = 0;
        this.minItemId = 0;
        this.maxItemId = 0;
        this.minOutfitId = 0;
        this.maxOutfitId = 0;
        this.minEffectId = 0;
        this.maxEffectId = 0;
        this.minMissileId = 0;
        this.maxMissileId = 0;
        this.sprSignature = 0;
        this.minSpriteId = 0;
        this.maxSpriteId = 0;
        this.extended = false;
        this.transparency = false;
        this.improvedAnimations = false;
        this.frameGroups = false;
        this.changed = false;
        this.isTemporary = false;
        this.loaded = false;
        this.spriteSize = 0;
        this.spriteDataSize = 0;
    }
}
exports.ClientInfo = ClientInfo;

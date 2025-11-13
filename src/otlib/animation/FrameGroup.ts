import { Size } from "../geom/Size";
import { SpriteExtent } from "../utils/SpriteExtent";
import { FrameDuration } from "./FrameDuration";
import { AnimationMode } from "./AnimationMode";

export class FrameGroup {
    public type: number = 0;
    public width: number = 1;
    public height: number = 1;
    public exactSize: number = SpriteExtent.DEFAULT_SIZE;
    public layers: number = 1;
    public patternX: number = 1;
    public patternY: number = 1;
    public patternZ: number = 1;
    public frames: number = 1;
    public spriteIndex: number[] | null = null;
    public isAnimation: boolean = false;
    public animationMode: number = AnimationMode.ASYNCHRONOUS;
    public loopCount: number = 0;
    public startFrame: number = 0;
    public frameDurations: FrameDuration[] | null = null;

    constructor() {
        this.type = 0;
        this.width = 1;
        this.height = 1;
        this.layers = 1;
        this.frames = 1;
        this.patternX = 1;
        this.patternY = 1;
        this.patternZ = 1;
        this.exactSize = SpriteExtent.DEFAULT_SIZE;
        this.isAnimation = false;
        this.animationMode = AnimationMode.ASYNCHRONOUS;
        this.loopCount = 0;
        this.startFrame = 0;
        this.frameDurations = null;
    }

    public getFrameDuration(index: number): FrameDuration | null {
        if (this.frameDurations) {
            return this.frameDurations[index];
        }
        return null;
    }

    public getTotalX(): number {
        return this.patternZ * this.patternX * this.layers;
    }

    public getTotalY(): number {
        return this.frames * this.patternY;
    }

    public getTotalSprites(): number {
        return this.width *
               this.height *
               this.patternX *
               this.patternY *
               this.patternZ *
               this.frames *
               this.layers;
    }

    public getTotalTextures(): number {
        return this.patternX *
               this.patternY *
               this.patternZ *
               this.frames *
               this.layers;
    }

    public getSpriteIndex(width: number,
                         height: number,
                         layer: number,
                         patternX: number,
                         patternY: number,
                         patternZ: number,
                         frame: number): number {
        return ((((((frame % this.frames) *
                this.patternZ + patternZ) *
                this.patternY + patternY) *
                this.patternX + patternX) *
                this.layers + layer) *
                this.height + height) *
                this.width + width;
    }

    public getTextureIndex(layer: number,
                          patternX: number,
                          patternY: number,
                          patternZ: number,
                          frame: number): number {
        return (((frame % this.frames *
                this.patternZ + patternZ) *
                this.patternY + patternY) *
                this.patternX + patternX) *
                this.layers + layer;
    }

    public getSpriteSheetSize(): Size {
        const size = new Size();
        size.width = this.patternZ * this.patternX * this.layers * this.width * SpriteExtent.DEFAULT_SIZE;
        size.height = this.frames * this.patternY * this.height * SpriteExtent.DEFAULT_SIZE;
        return size;
    }

    public makeOutfitGroup(duration: number): void {
        this.patternX = 4; // Directions
        this.frames = 1;   // Animations
        this.isAnimation = false;
        this.frameDurations = new Array<FrameDuration>(this.frames);

        for (let i = 0; i < this.frames; i++) {
            this.frameDurations[i] = new FrameDuration(duration, duration);
        }

        this.spriteIndex = new Array<number>(this.getTotalSprites());
    }

    public clone(): FrameGroup {
        const group = new FrameGroup();
        group.type = this.type;
        group.width = this.width;
        group.height = this.height;
        group.layers = this.layers;
        group.frames = this.frames;
        group.patternX = this.patternX;
        group.patternY = this.patternY;
        group.patternZ = this.patternZ;
        group.exactSize = this.exactSize;

        if (this.spriteIndex) {
            group.spriteIndex = [...this.spriteIndex];
        }

        group.animationMode = this.animationMode;
        group.loopCount = this.loopCount;
        group.startFrame = this.startFrame;

        if (this.frames > 1) {
            group.isAnimation = true;

            group.frameDurations = new Array<FrameDuration>(this.frames);
            if (this.frameDurations) {
                for (let i = 0; i < this.frames; i++) {
                    group.frameDurations[i] = this.frameDurations[i].clone();
                }
            }
        }

        return group;
    }
}


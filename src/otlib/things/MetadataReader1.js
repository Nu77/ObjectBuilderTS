"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataReader1 = void 0;
const FrameGroup_1 = require("../animation/FrameGroup");
const FrameDuration_1 = require("../animation/FrameDuration");
const ThingCategory_1 = require("./ThingCategory");
const MetadataReader_1 = require("./MetadataReader");
const MetadataFlags1_1 = require("./MetadataFlags1");
const SpriteExtent_1 = require("../utils/SpriteExtent");
const Resources_1 = require("../resources/Resources");
/**
 * Reader for versions 7.10 - 7.30
 */
class MetadataReader1 extends MetadataReader_1.MetadataReader {
    constructor(bytes) {
        super(bytes);
    }
    readProperties(type) {
        let flag = 0;
        while (flag < MetadataFlags1_1.MetadataFlags1.LAST_FLAG) {
            const previousFlag = flag;
            flag = this.readUnsignedByte();
            if (flag === MetadataFlags1_1.MetadataFlags1.LAST_FLAG) {
                return true;
            }
            switch (flag) {
                case MetadataFlags1_1.MetadataFlags1.GROUND:
                    type.isGround = true;
                    type.groundSpeed = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.ON_BOTTOM:
                    type.isOnBottom = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.ON_TOP:
                    type.isOnTop = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.CONTAINER:
                    type.isContainer = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.STACKABLE:
                    type.stackable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.MULTI_USE:
                    type.multiUse = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.FORCE_USE:
                    type.forceUse = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.WRITABLE:
                    type.writable = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.WRITABLE_ONCE:
                    type.writableOnce = true;
                    type.maxTextLength = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.FLUID_CONTAINER:
                    type.isFluidContainer = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.FLUID:
                    type.isFluid = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.UNPASSABLE:
                    type.isUnpassable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.UNMOVEABLE:
                    type.isUnmoveable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.BLOCK_MISSILE:
                    type.blockMissile = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.BLOCK_PATHFINDER:
                    type.blockPathfind = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.PICKUPABLE:
                    type.pickupable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.HAS_LIGHT:
                    type.hasLight = true;
                    type.lightLevel = this.readUnsignedShort();
                    type.lightColor = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.FLOOR_CHANGE:
                    type.floorChange = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.FULL_GROUND:
                    type.isFullGround = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.HAS_ELEVATION:
                    type.hasElevation = true;
                    type.elevation = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.HAS_OFFSET:
                    type.hasOffset = true;
                    type.offsetX = 8;
                    type.offsetY = 8;
                    break;
                case MetadataFlags1_1.MetadataFlags1.MINI_MAP:
                    type.miniMap = true;
                    type.miniMapColor = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.ROTATABLE:
                    type.rotatable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.LYING_OBJECT:
                    type.isLyingObject = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.ANIMATE_ALWAYS:
                    type.animateAlways = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.LENS_HELP:
                    type.isLensHelp = true;
                    type.lensHelp = this.readUnsignedShort();
                    break;
                case MetadataFlags1_1.MetadataFlags1.WRAPPABLE:
                    type.wrappable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.UNWRAPPABLE:
                    type.unwrappable = true;
                    break;
                case MetadataFlags1_1.MetadataFlags1.TOP_EFFECT:
                    type.topEffect = true;
                    break;
                default:
                    throw new Error(Resources_1.Resources.getString("readUnknownFlag", flag.toString(16), previousFlag.toString(16), Resources_1.Resources.getString(type.category), type.id.toString()));
            }
        }
        return true;
    }
    readTexturePatterns(type, extended, frameDurations, frameGroups) {
        let groupCount = 1;
        if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
            groupCount = this.readUnsignedByte();
        }
        for (let groupType = 0; groupType < groupCount; groupType++) {
            if (frameGroups && type.category === ThingCategory_1.ThingCategory.OUTFIT) {
                this.readUnsignedByte();
            }
            const frameGroup = new FrameGroup_1.FrameGroup();
            frameGroup.type = groupType;
            frameGroup.width = this.readUnsignedByte();
            frameGroup.height = this.readUnsignedByte();
            if (frameGroup.width > 1 || frameGroup.height > 1) {
                frameGroup.exactSize = this.readUnsignedByte();
            }
            else {
                frameGroup.exactSize = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
            }
            frameGroup.layers = this.readUnsignedByte();
            frameGroup.patternX = this.readUnsignedByte();
            frameGroup.patternY = this.readUnsignedByte();
            frameGroup.patternZ = 1;
            frameGroup.frames = this.readUnsignedByte();
            if (frameGroup.frames > 1) {
                frameGroup.isAnimation = true;
                frameGroup.frameDurations = new Array(frameGroup.frames);
                if (frameDurations && this.settings) {
                    frameGroup.animationMode = this.readUnsignedByte();
                    frameGroup.loopCount = this.readInt();
                    frameGroup.startFrame = this.readByte();
                    for (let i = 0; i < frameGroup.frames; i++) {
                        const minimum = this.readUnsignedInt();
                        const maximum = this.readUnsignedInt();
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(minimum, maximum);
                    }
                }
                else if (this.settings) {
                    const duration = this.settings.getDefaultDuration(type.category);
                    for (let i = 0; i < frameGroup.frames; i++) {
                        frameGroup.frameDurations[i] = new FrameDuration_1.FrameDuration(duration, duration);
                    }
                }
            }
            const totalSprites = frameGroup.getTotalSprites();
            if (totalSprites > SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE) {
                throw new Error(`A thing type has more than ${SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE} sprites.`);
            }
            frameGroup.spriteIndex = new Array(totalSprites);
            for (let i = 0; i < totalSprites; i++) {
                if (extended) {
                    frameGroup.spriteIndex[i] = this.readUnsignedInt();
                }
                else {
                    frameGroup.spriteIndex[i] = this.readUnsignedShort();
                }
            }
            type.setFrameGroup(groupType, frameGroup);
        }
        return true;
    }
}
exports.MetadataReader1 = MetadataReader1;

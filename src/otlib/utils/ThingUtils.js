"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThingUtils = void 0;
const ThingType_1 = require("../things/ThingType");
const ThingCategory_1 = require("../things/ThingCategory");
const FrameGroupType_1 = require("../things/FrameGroupType");
class ThingUtils {
    constructor() {
        throw new Error("ThingUtils is a static class and cannot be instantiated");
    }
    static createAlertThing(category, duration) {
        const thing = ThingType_1.ThingType.create(0, category, false, duration);
        if (thing) {
            const frameGroup = thing.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
            if (frameGroup && frameGroup.spriteIndex) {
                const length = frameGroup.spriteIndex.length;
                for (let i = 0; i < length; i++) {
                    frameGroup.spriteIndex[i] = 0xFFFFFFFF;
                }
            }
        }
        return thing;
    }
    static isValid(thing) {
        if (!thing) {
            return false;
        }
        const frameGroup = thing.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        if (!frameGroup) {
            return false;
        }
        return frameGroup.width !== 0 && frameGroup.height !== 0;
    }
    static isEmpty(thing) {
        const frameGroup = thing?.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        if (!frameGroup) {
            return true;
        }
        const length = frameGroup.spriteIndex ? frameGroup.spriteIndex.length : 0;
        if (length === 0) {
            return true;
        }
        if (length === 1 && frameGroup.spriteIndex && frameGroup.spriteIndex[0] === 0) {
            return true;
        }
        if (thing && ((length === 12 && thing.category === ThingCategory_1.ThingCategory.OUTFIT) ||
            (length === 9 && thing.category === ThingCategory_1.ThingCategory.MISSILE))) {
            if (frameGroup.spriteIndex) {
                for (let i = length - 1; i >= 0; i--) {
                    if (frameGroup.spriteIndex[i] !== 0) {
                        return false;
                    }
                }
            }
            return true;
        }
        // TODO: Check all properties
        return false;
    }
    static convertFrameGroups(thingData, frameGroups, improvedAnimations, duration, removeMounts) {
        if (!thingData.thing) {
            return;
        }
        if (thingData.thing.animateAlways || thingData.category !== ThingCategory_1.ThingCategory.OUTFIT) {
            return;
        }
        if (frameGroups === ThingUtils.REMOVE_FRAME_GROUPS) {
            if (thingData.thing.frameGroups.length <= 1) {
                return;
            }
            thingData.thing.removeFrameGroupState(improvedAnimations, duration, removeMounts);
            thingData.removeFrameGroupSprites();
        }
        else if (frameGroups === ThingUtils.ADD_FRAME_GROUPS) {
            if (thingData.thing.frameGroups.length > 1) {
                return;
            }
            thingData.thing.addFrameGroupState(improvedAnimations, duration);
            thingData.addFrameGroupSprites();
        }
    }
}
exports.ThingUtils = ThingUtils;
ThingUtils.REMOVE_FRAME_GROUPS = 0;
ThingUtils.ADD_FRAME_GROUPS = 1;

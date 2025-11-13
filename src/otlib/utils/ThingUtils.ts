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

import { ThingType } from "../things/ThingType";
import { ThingCategory } from "../things/ThingCategory";
import { FrameGroupType } from "../things/FrameGroupType";
import { FrameGroup } from "../animation/FrameGroup";
import { ThingData } from "../things/ThingData";

export class ThingUtils {
    public static readonly REMOVE_FRAME_GROUPS: number = 0;
    public static readonly ADD_FRAME_GROUPS: number = 1;

    private constructor() {
        throw new Error("ThingUtils is a static class and cannot be instantiated");
    }

    public static createAlertThing(category: string, duration: number): ThingType {
        const thing = ThingType.create(0, category, false, duration);
        if (thing) {
            const frameGroup = thing.getFrameGroup(FrameGroupType.DEFAULT);
            if (frameGroup && frameGroup.spriteIndex) {
                const length = frameGroup.spriteIndex.length;
                for (let i = 0; i < length; i++) {
                    frameGroup.spriteIndex[i] = 0xFFFFFFFF;
                }
            }
        }
        return thing;
    }

    public static isValid(thing: ThingType | null): boolean {
        if (!thing) {
            return false;
        }

        const frameGroup = thing.getFrameGroup(FrameGroupType.DEFAULT);
        if (!frameGroup) {
            return false;
        }

        return frameGroup.width !== 0 && frameGroup.height !== 0;
    }

    public static isEmpty(thing: ThingType | null): boolean {
        const frameGroup = thing?.getFrameGroup(FrameGroupType.DEFAULT);
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

        if (thing && ((length === 12 && thing.category === ThingCategory.OUTFIT) ||
            (length === 9 && thing.category === ThingCategory.MISSILE))) {
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

    public static convertFrameGroups(thingData: ThingData, frameGroups: number, improvedAnimations: boolean, duration: number, removeMounts: boolean): void {
        if (!thingData.thing) {
            return;
        }
        if (thingData.thing.animateAlways || thingData.category !== ThingCategory.OUTFIT) {
            return;
        }

        if (frameGroups === ThingUtils.REMOVE_FRAME_GROUPS) {
            if (thingData.thing.frameGroups.length <= 1) {
                return;
            }

            thingData.thing.removeFrameGroupState(improvedAnimations, duration, removeMounts);
            thingData.removeFrameGroupSprites();
        } else if (frameGroups === ThingUtils.ADD_FRAME_GROUPS) {
            if (thingData.thing.frameGroups.length > 1) {
                return;
            }

            thingData.thing.addFrameGroupState(improvedAnimations, duration);
            thingData.addFrameGroupSprites();
        }
    }
}


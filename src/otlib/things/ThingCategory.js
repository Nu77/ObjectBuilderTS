"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ThingCategory = void 0;
class ThingCategory {
    constructor() {
        throw new Error("ThingCategory is a static class and cannot be instantiated");
    }
    static isValid(category) {
        return (category === ThingCategory.ITEM ||
            category === ThingCategory.OUTFIT ||
            category === ThingCategory.EFFECT ||
            category === ThingCategory.MISSILE);
    }
    static getCategory(value) {
        if (value) {
            const normalized = value.toLowerCase().trim();
            switch (normalized) {
                case "item":
                    return ThingCategory.ITEM;
                case "outfit":
                    return ThingCategory.OUTFIT;
                case "effect":
                    return ThingCategory.EFFECT;
                case "missile":
                    return ThingCategory.MISSILE;
            }
        }
        return null;
    }
    static getCategoryByValue(value) {
        switch (value) {
            case 1:
                return ThingCategory.ITEM;
            case 2:
                return ThingCategory.OUTFIT;
            case 3:
                return ThingCategory.EFFECT;
            case 4:
                return ThingCategory.MISSILE;
        }
        return null;
    }
    static getValue(category) {
        if (category) {
            switch (category) {
                case "item":
                    return 1;
                case "outfit":
                    return 2;
                case "effect":
                    return 3;
                case "missile":
                    return 4;
            }
        }
        return 0;
    }
}
exports.ThingCategory = ThingCategory;
ThingCategory.ITEM = "item";
ThingCategory.OUTFIT = "outfit";
ThingCategory.EFFECT = "effect";
ThingCategory.MISSILE = "missile";

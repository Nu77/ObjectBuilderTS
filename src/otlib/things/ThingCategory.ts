export class ThingCategory {
    public static readonly ITEM: string = "item";
    public static readonly OUTFIT: string = "outfit";
    public static readonly EFFECT: string = "effect";
    public static readonly MISSILE: string = "missile";

    private constructor() {
        throw new Error("ThingCategory is a static class and cannot be instantiated");
    }

    public static isValid(category: string): boolean {
        return (category === ThingCategory.ITEM || 
                category === ThingCategory.OUTFIT || 
                category === ThingCategory.EFFECT || 
                category === ThingCategory.MISSILE);
    }

    public static getCategory(value: string | null | undefined): string | null {
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

    public static getCategoryByValue(value: number): string | null {
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

    public static getValue(category: string): number {
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


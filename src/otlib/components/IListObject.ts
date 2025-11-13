import { BitmapData } from "../utils/BitmapData";

export interface IListObject {
    readonly id: number;

    /**
     * @param backgroundColor A 32-bit ARGB color value.
     */
    getBitmap(backgroundColor?: number): BitmapData | null;
}


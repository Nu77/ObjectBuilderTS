"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorUtils = void 0;
class ColorUtils {
    constructor() {
        throw new Error("ColorUtils is a static class and cannot be instantiated");
    }
    static toARGB(color, alpha = 0xFF) {
        const R = (color >> 16) & 0xFF;
        const G = (color >> 8) & 0xFF;
        const B = color & 0xFF;
        alpha = alpha > 0xFF ? 0xFF : alpha;
        return (alpha << 24) | (R << 16) | (G << 8) | B;
    }
    static HSItoRGB(color) {
        const values = 7;
        const steps = 19;
        let H = 0;
        let S = 0;
        let I = 0;
        let R = 0;
        let G = 0;
        let B = 0;
        if (color >= steps * values) {
            color = 0;
        }
        if (color % steps === 0) {
            H = 0;
            S = 0;
            I = 1 - color / steps / values;
        }
        else {
            H = (color % steps) * (1 / 18);
            S = 1;
            I = 1;
            switch (Math.floor(color / steps)) {
                case 0:
                    S = 0.25;
                    I = 1;
                    break;
                case 1:
                    S = 0.25;
                    I = 0.75;
                    break;
                case 2:
                    S = 0.5;
                    I = 0.75;
                    break;
                case 3:
                    S = 0.667;
                    I = 0.75;
                    break;
                case 4:
                    S = 1;
                    I = 1;
                    break;
                case 5:
                    S = 1;
                    I = 0.75;
                    break;
                case 6:
                    S = 1;
                    I = 0.5;
                    break;
            }
        }
        if (I === 0) {
            return 0x000000;
        }
        if (S === 0) {
            return (Math.floor(I * 0xFF) << 16) | (Math.floor(I * 0xFF) << 8) | Math.floor(I * 0xFF);
        }
        if (H < 1 / 6) {
            R = I;
            B = I * (1 - S);
            G = B + (I - B) * 6 * H;
        }
        else if (H < 2 / 6) {
            G = I;
            B = I * (1 - S);
            R = G - (I - B) * (6 * H - 1);
        }
        else if (H < 3 / 6) {
            G = I;
            R = I * (1 - S);
            B = R + (I - R) * (6 * H - 2);
        }
        else if (H < 4 / 6) {
            B = I;
            R = I * (1 - S);
            G = B - (I - R) * (6 * H - 3);
        }
        else if (H < 5 / 6) {
            B = I;
            G = I * (1 - S);
            R = G + (I - G) * (6 * H - 4);
        }
        else {
            R = I;
            G = I * (1 - S);
            B = R - (I - G) * (6 * H - 5);
        }
        return (Math.floor(R * 0xFF) << 16) | (Math.floor(G * 0xFF) << 8) | Math.floor(B * 0xFF);
    }
    static HSItoARGB(color) {
        const rgb = ColorUtils.HSItoRGB(color);
        return ColorUtils.toARGB(rgb);
    }
    static from8Bit(color) {
        if (color >= 216)
            return 0;
        const R = Math.floor(color / 36) % 6 * 51;
        const G = Math.floor(color / 6) % 6 * 51;
        const B = (color % 6) * 51;
        return (R << 16) | (G << 8) | B;
    }
}
exports.ColorUtils = ColorUtils;

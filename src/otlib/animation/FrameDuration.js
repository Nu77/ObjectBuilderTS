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
exports.FrameDuration = void 0;
class FrameDuration {
    get duration() {
        if (this.minimum === this.maximum) {
            return this.minimum;
        }
        return this.minimum + Math.round(Math.random() * (this.maximum - this.minimum));
    }
    constructor(minimum = 0, maximum = 0) {
        if (minimum > maximum) {
            throw new Error("The minimum value may not be greater than the maximum value.");
        }
        this.minimum = minimum;
        this.maximum = maximum;
    }
    toString() {
        return `[FrameDuration minimum=${this.minimum}, maximum=${this.maximum}]`;
    }
    equals(frameDuration) {
        return (this.minimum === frameDuration.minimum && this.maximum === frameDuration.maximum);
    }
    clone() {
        return new FrameDuration(this.minimum, this.maximum);
    }
}
exports.FrameDuration = FrameDuration;

"use strict";

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

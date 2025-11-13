export class FrameDuration {
    public minimum: number;
    public maximum: number;

    public get duration(): number {
        if (this.minimum === this.maximum) {
            return this.minimum;
        }

        return this.minimum + Math.round(Math.random() * (this.maximum - this.minimum));
    }

    constructor(minimum: number = 0, maximum: number = 0) {
        if (minimum > maximum) {
            throw new Error("The minimum value may not be greater than the maximum value.");
        }

        this.minimum = minimum;
        this.maximum = maximum;
    }

    public toString(): string {
        return `[FrameDuration minimum=${this.minimum}, maximum=${this.maximum}]`;
    }

    public equals(frameDuration: FrameDuration): boolean {
        return (this.minimum === frameDuration.minimum && this.maximum === frameDuration.maximum);
    }

    public clone(): FrameDuration {
        return new FrameDuration(this.minimum, this.maximum);
    }
}


export class Rect {
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public setTo(x: number, y: number, width: number, height: number): Rect {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    public setFrom(rect: Rect): Rect {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
        return this;
    }

    public setEmpty(): Rect {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        return this;
    }

    public clone(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }
}


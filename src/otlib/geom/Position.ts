export class Position {
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public toString(): string {
        return `(x:${this.x}, y:${this.y}, z:${this.z})`;
    }

    public equals(position: Position | null): boolean {
        return (position != null && position.x === this.x && position.y === this.y && position.z === this.z);
    }

    public isZero(): boolean {
        return (this.x === 0 && this.y === 0 && this.z === 0);
    }

    public setTo(x: number, y: number, z: number): Position {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    public setEmpty(): Position {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    }

    public setFrom(position: Position): Position {
        this.x = position.x;
        this.y = position.y;
        this.z = position.z;
        return this;
    }

    public clone(): Position {
        return new Position(this.x, this.y, this.z);
    }
}


export class SpriteDimension {
    public value: string = "";
    public size: number = 0;
    public dataSize: number = 0;

    constructor() {
    }

    public toString(): string {
        return this.value;
    }

    public serialize(): any {
        return {
            value: this.value,
            size: this.size,
            dataSize: this.dataSize
        };
    }

    public unserialize(xml: any): void {
        if (!xml) {
            throw new Error("xml cannot be null");
        }

        if (xml.value === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'value' attribute.");
        }

        if (xml.size === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'size' attribute.");
        }

        if (xml.dataSize === undefined) {
            throw new Error("SpriteDimension.unserialize: Missing 'dataSize' attribute.");
        }

        this.value = String(xml.value);
        this.size = parseInt(xml.size, 10);
        this.dataSize = parseInt(xml.dataSize, 10);
    }
}


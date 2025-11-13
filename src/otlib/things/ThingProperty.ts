export class ThingProperty {
    public property: string = "";
    public value: any = null;

    constructor() {
    }

    public toString(): string {
        return `[ThingProperty property=${this.property}, value=${this.value}]`;
    }
}


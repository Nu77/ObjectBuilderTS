export class Version {
    public value: number = 0;
    public valueStr: string = "";
    public datSignature: number = 0;
    public sprSignature: number = 0;
    public otbVersion: number = 0;

    constructor() {
    }

    public toString(): string {
        return this.valueStr;
    }

    public equals(version: Version | null): boolean {
        if (version &&
            version.value === this.value &&
            version.valueStr === this.valueStr &&
            version.datSignature === this.datSignature &&
            version.sprSignature === this.sprSignature &&
            version.otbVersion === this.otbVersion) {
            return true;
        }
        return false;
    }

    public clone(): Version {
        const version = new Version();
        version.value = this.value;
        version.valueStr = this.valueStr;
        version.datSignature = this.datSignature;
        version.sprSignature = this.sprSignature;
        version.otbVersion = this.otbVersion;
        return version;
    }

    public serialize(): any {
        return {
            value: this.value,
            string: this.valueStr,
            dat: this.datSignature.toString(16).toUpperCase(),
            spr: this.sprSignature.toString(16).toUpperCase(),
            otb: this.otbVersion
        };
    }

    public unserialize(xml: any): void {
        if (!xml) {
            throw new Error("xml cannot be null");
        }

        if (xml.value === undefined) {
            throw new Error("Version.unserialize: Missing 'value' attribute.");
        }

        if (xml.string === undefined) {
            throw new Error("Version.unserialize: Missing 'string' attribute.");
        }

        if (xml.dat === undefined) {
            throw new Error("Version.unserialize: Missing 'dat' attribute.");
        }

        if (xml.spr === undefined) {
            throw new Error("Version.unserialize: Missing 'spr' attribute.");
        }

        if (xml.otb === undefined) {
            throw new Error("Version.unserialize: Missing 'otb' attribute.");
        }

        this.value = parseInt(xml.value, 10);
        this.valueStr = String(xml.string);
        this.datSignature = parseInt(`0x${xml.dat}`, 16);
        this.sprSignature = parseInt(`0x${xml.spr}`, 16);
        this.otbVersion = parseInt(xml.otb, 10);
    }
}


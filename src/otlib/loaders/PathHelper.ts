export class PathHelper {
    public id: number = 0;
    public nativePath: string = "";

    constructor(nativePath: string | null = null, id: number = 0) {
        this.id = id;
        this.nativePath = nativePath || "";
    }

    public toString(): string {
        return `[object PathHelper id=${this.id}, nativePath=${this.nativePath}]`;
    }
}


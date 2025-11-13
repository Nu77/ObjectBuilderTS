export class ChangeResult<T = any> {
    public list: T[] | null = null;
    public done: boolean = false;
    public message: string = "";

    constructor(list: T[] | null = null, done: boolean = false, message: string = "") {
        this.list = list;
        this.done = done;
        this.message = message || "";
    }

    public update(list: T[] | null = null, done: boolean = false, message: string = ""): ChangeResult<T> {
        this.list = list;
        this.done = done;
        this.message = message || "";
        return this;
    }
}


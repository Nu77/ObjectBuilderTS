export class OutfitData {
    public head: number = 0;
    public body: number = 0;
    public legs: number = 0;
    public feet: number = 0;
    public addons: number = 0;

    constructor(head: number = 0, body: number = 0, legs: number = 0, feet: number = 0, addons: number = 0) {
        this.head = head;
        this.body = body;
        this.legs = legs;
        this.feet = feet;
        this.addons = addons;
    }

    public setTo(head: number = 0, body: number = 0, legs: number = 0, feet: number = 0, addons: number = 0): OutfitData {
        this.head = head;
        this.body = body;
        this.legs = legs;
        this.feet = feet;
        this.addons = addons;
        return this;
    }

    public setFrom(data: OutfitData): OutfitData {
        this.head = data.head;
        this.body = data.body;
        this.legs = data.legs;
        this.feet = data.feet;
        this.addons = data.addons;
        return this;
    }

    public clone(): OutfitData {
        return new OutfitData(this.head, this.body, this.legs, this.feet, this.addons);
    }
}


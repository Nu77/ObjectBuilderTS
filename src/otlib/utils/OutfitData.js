"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.OutfitData = void 0;
class OutfitData {
    constructor(head = 0, body = 0, legs = 0, feet = 0, addons = 0) {
        this.head = 0;
        this.body = 0;
        this.legs = 0;
        this.feet = 0;
        this.addons = 0;
        this.head = head;
        this.body = body;
        this.legs = legs;
        this.feet = feet;
        this.addons = addons;
    }
    setTo(head = 0, body = 0, legs = 0, feet = 0, addons = 0) {
        this.head = head;
        this.body = body;
        this.legs = legs;
        this.feet = feet;
        this.addons = addons;
        return this;
    }
    setFrom(data) {
        this.head = data.head;
        this.body = data.body;
        this.legs = data.legs;
        this.feet = data.feet;
        this.addons = data.addons;
        return this;
    }
    clone() {
        return new OutfitData(this.head, this.body, this.legs, this.feet, this.addons);
    }
}
exports.OutfitData = OutfitData;

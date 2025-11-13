"use strict";
/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
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

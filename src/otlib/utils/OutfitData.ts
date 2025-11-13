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


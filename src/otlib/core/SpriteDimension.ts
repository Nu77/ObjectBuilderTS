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


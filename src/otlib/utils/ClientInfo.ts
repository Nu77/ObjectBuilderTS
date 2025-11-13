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

export class ClientInfo {
    public clientVersion: number = 0;
    public clientVersionStr: string = "";
    public datSignature: number = 0;
    public minItemId: number = 0;
    public maxItemId: number = 0;
    public minOutfitId: number = 0;
    public maxOutfitId: number = 0;
    public minEffectId: number = 0;
    public maxEffectId: number = 0;
    public minMissileId: number = 0;
    public maxMissileId: number = 0;
    public sprSignature: number = 0;
    public minSpriteId: number = 0;
    public maxSpriteId: number = 0;
    public extended: boolean = false;
    public transparency: boolean = false;
    public improvedAnimations: boolean = false;
    public frameGroups: boolean = false;
    public changed: boolean = false;
    public isTemporary: boolean = false;
    public loaded: boolean = false;
    public spriteSize: number = 0;
    public spriteDataSize: number = 0;

    constructor() {
    }
}


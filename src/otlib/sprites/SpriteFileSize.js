"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteFileSize = void 0;
const SpriteFilePosition_1 = require("./SpriteFilePosition");
class SpriteFileSize {
    constructor() {
        throw new Error("SpriteFileSize is a static class and cannot be instantiated");
    }
}
exports.SpriteFileSize = SpriteFileSize;
/** The size for header without extended option enabled. **/
SpriteFileSize.HEADER_U16 = SpriteFilePosition_1.SpriteFilePosition.LENGTH + 2;
/** The size for header with extended option enabled. **/
SpriteFileSize.HEADER_U32 = SpriteFilePosition_1.SpriteFilePosition.LENGTH + 4;
/** The size of sprite address in bytes. **/
SpriteFileSize.ADDRESS = 4;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const optimizeImage = async (filePath) => {
    const fileExt = path_1.default.extname(filePath);
    const optimizedPath = filePath.replace(fileExt, '-optimized' + fileExt);
    await (0, sharp_1.default)(filePath)
        .resize(1024) // Resize width to max 1024px while maintaining aspect ratio
        .jpeg({ quality: 80 }) // Convert to JPEG and reduce quality to 80%
        .toFile(optimizedPath);
    // Delete the original file
    await promises_1.default.unlink(filePath);
    // Rename optimized file to original name
    await promises_1.default.rename(optimizedPath, filePath);
    return filePath;
};
exports.optimizeImage = optimizeImage;

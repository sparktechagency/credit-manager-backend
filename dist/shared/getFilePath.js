"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleFilesPath = exports.getSingleFilePath = void 0;
const path_1 = __importDefault(require("path"));
const imageOptimize_1 = require("../util/imageOptimize");
// single file
const getSingleFilePath = async (files, folderName) => {
    const fileField = files && files[folderName];
    if (fileField && Array.isArray(fileField) && fileField.length > 0) {
        const originalFilePath = path_1.default.join(process.cwd(), 'uploads', folderName, fileField[0].filename);
        const optimizedFilePath = await (0, imageOptimize_1.optimizeImage)(originalFilePath);
        const relativePath = optimizedFilePath.replace(path_1.default.join(process.cwd(), 'uploads'), '');
        return `${relativePath.replace(/\\/g, '/')}`;
    }
    return undefined;
};
exports.getSingleFilePath = getSingleFilePath;
//multiple files
const getMultipleFilesPath = async (files, folderName) => {
    const folderFiles = files && files[folderName];
    if (folderFiles && Array.isArray(folderFiles)) {
        const optimizedPaths = await Promise.all(folderFiles.map(async (file) => {
            const originalFilePath = path_1.default.join(process.cwd(), 'uploads', folderName, file.filename);
            const optimizedFilePath = await (0, imageOptimize_1.optimizeImage)(originalFilePath);
            // Convert absolute path to a proper relative path
            const relativePath = optimizedFilePath.replace(path_1.default.join(process.cwd(), 'uploads'), '');
            return relativePath;
        }));
        return optimizedPaths;
    }
    return undefined;
};
exports.getMultipleFilesPath = getMultipleFilesPath;

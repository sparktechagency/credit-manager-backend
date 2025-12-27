"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const uploadDirectories = {
    image: 'image',
    video: 'video',
    doc: 'doc',
    pdf: 'pdf'
};
const fileUploadHandler = () => {
    //create upload folder
    const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir);
    }
    //folder create for different file
    const createDir = (dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath);
        }
    };
    //create filename
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const folderName = uploadDirectories[file.fieldname];
            if (!folderName) {
                cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File type not supported'), '');
            }
            const uploadDir = path_1.default.join(baseUploadDir, folderName);
            createDir(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = file.originalname
                .replace(fileExt, '')
                .toLowerCase()
                .split(' ')
                .join('-') +
                '-' +
                Date.now();
            cb(null, fileName + fileExt);
        },
    });
    //allowed mime types
    const allowedMimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/jpg'],
        pdf: ['application/pdf'],
        doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        video: ['video/mp4', 'video/mpeg'],
    };
    //file filter
    const filterFilter = (req, file, cb) => {
        //allowed mime types
        const allowedTypes = allowedMimeTypes[file.fieldname];
        //check allowed mime types
        if (!allowedTypes) {
            return cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `File field '${file.fieldname}' is not supported`));
        }
        //check file type
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `File type '${file.mimetype}' is not supported`));
        }
        cb(null, true);
    };
    const upload = (0, multer_1.default)({ storage: storage, fileFilter: filterFilter })
        .fields([{ name: 'image', maxCount: 3 }]);
    return upload;
};
exports.default = fileUploadHandler;

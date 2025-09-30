import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiErrors';

const uploadDirectories: Record<string, string> = {
    image: 'image',
    video: 'video',
    doc: 'doc',
    pdf: 'pdf'
};


const fileUploadHandler = () => {

    //create upload folder
    const baseUploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir);
    }

    //folder create for different file
    const createDir = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    };

    //create filename
    const storage = multer.diskStorage({

        destination: (req, file, cb) => {
            const folderName = uploadDirectories[file.fieldname];

            if (!folderName) {
                cb(new ApiError(StatusCodes.BAD_REQUEST, 'File type not supported'), '');
            }

            const uploadDir = path.join(baseUploadDir, folderName);
            createDir(uploadDir);
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
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
    const allowedMimeTypes: Record<string, string[]> = {
        image: ['image/jpeg', 'image/png', 'image/jpg'],
        pdf: ['application/pdf'],
        doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        video: ['video/mp4', 'video/mpeg'],
    };


    //file filter
    const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {

        //allowed mime types
        const allowedTypes = allowedMimeTypes[file.fieldname];

        //check allowed mime types
        if (!allowedTypes) {
            return cb(new ApiError(StatusCodes.BAD_REQUEST, `File field '${file.fieldname}' is not supported`));
        }

        //check file type
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new ApiError(StatusCodes.BAD_REQUEST, `File type '${file.mimetype}' is not supported`));
        }
        cb(null, true);

    };

    const upload = multer({ storage: storage, fileFilter: filterFilter })
        .fields([{ name: 'image', maxCount: 3 }]);
    return upload;

};

export default fileUploadHandler;
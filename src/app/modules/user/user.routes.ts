import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { createUserZodValidationSchema } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
        UserController.retrieveProfile
    )
    .post(
        validateRequest(createUserZodValidationSchema),
        UserController.createUser
    )
    .put(
        auth(USER_ROLES.SUPER_ADMIN),
        UserController.checkUsername
    )
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {

                const profile = await getSingleFilePath(req.files, "image");
                req.body = { ...req.body, profile };
                next();

            } catch (error) {
                res.status(500).json({ message: "Failed to Process Update Profile" });
            }
        },
        UserController.updateProfile
    );

export const UserRoutes = router;
import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { ClientController } from './client.controller';
import { ClientZodValidationSchema } from './client.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.retrieveClients
    )
    .post(
        auth(USER_ROLES.SUPER_ADMIN),
        validateRequest(ClientZodValidationSchema),
        ClientController.createClients
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
        ClientController.updateClientProfile
    );

router.route('/summary')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.retrieveSummary
    );

router.route('/statistic')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.clientStatics
    );

router.route('/active-statistic')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.activeClientStatics
    );

router.route('/:id')
    .patch(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.deactivedClient
    )
    .put(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.updateClientProfile
    )

export const ClientRoutes = router;
import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CurrencyController } from './currency.controller';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        CurrencyController.getCurrency
    )
    .post(
        auth(USER_ROLES.SUPER_ADMIN),
        CurrencyController.addCurrency
    )

export const CurrencyRoutes = router;
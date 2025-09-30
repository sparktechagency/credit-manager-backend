import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { ClientController } from './transaction.controller';
import { TransactionZodValidationSchema } from './transaction.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.retrieveTransactions
    )
    .patch(
        auth(USER_ROLES.SUPER_ADMIN),
        async (req: Request, res: Response, next: NextFunction) => {
            try {

                const { amount } = req.body;
                req.body = { ...req.body, amount: Number(amount) };
                next();

            } catch (error) {
                res.status(500).json({ message: "Failed to Process Update Transaction" });
            }
        },
        ClientController.updateTransaction
    );


router.route('/:id')
    .patch(
        auth(USER_ROLES.SUPER_ADMIN),
        async (req: Request, res: Response, next: NextFunction) => {
            try {

                const { amount } = req.body;
                req.body = {
                    ...req.body,
                    client: req.params.id,
                    type: 'credit',
                    amount: Number(amount)
                };
                next();

            } catch (error) {
                res.status(500).json({ message: "Failed to Process Update Transaction" });
            }
        },
        ClientController.addCredit
    )   
    .put(
        auth(USER_ROLES.SUPER_ADMIN),
        ClientController.addCredit
    )

export const TransactionRoutes = router;
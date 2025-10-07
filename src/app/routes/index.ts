import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ClientRoutes } from '../modules/client/client.routes';
import { TransactionRoutes } from '../modules/transaction/transaction.routes';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/client", route: ClientRoutes },
    { path: "/transaction", route: TransactionRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
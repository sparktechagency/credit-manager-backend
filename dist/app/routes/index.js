"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const client_routes_1 = require("../modules/client/client.routes");
const transaction_routes_1 = require("../modules/transaction/transaction.routes");
const router = express_1.default.Router();
const apiRoutes = [
    { path: "/user", route: user_routes_1.UserRoutes },
    { path: "/auth", route: auth_routes_1.AuthRoutes },
    { path: "/client", route: client_routes_1.ClientRoutes },
    { path: "/transaction", route: transaction_routes_1.TransactionRoutes },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;

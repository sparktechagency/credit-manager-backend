"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const transaction_controller_1 = require("./transaction.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), transaction_controller_1.ClientController.retrieveTransactions)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), async (req, res, next) => {
    try {
        const { amount } = req.body;
        req.body = { ...req.body, amount: Number(amount) };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Failed to Process Update Transaction" });
    }
}, transaction_controller_1.ClientController.updateTransaction);
router.route("/statistic")
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), transaction_controller_1.ClientController.transactionStatistics);
router.route('/:id')
    .get(transaction_controller_1.ClientController.clientTransaction)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), transaction_controller_1.ClientController.updateTransaction)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), transaction_controller_1.ClientController.deleteTransaction)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), async (req, res, next) => {
    try {
        const { amount } = req.body;
        req.body = {
            ...req.body,
            client: req.params.id,
            type: 'credit',
            amount: Number(amount)
        };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Failed to Process Update Transaction" });
    }
}, transaction_controller_1.ClientController.addCredit)
    .put((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), async (req, res, next) => {
    try {
        const { amount } = req.body;
        req.body = {
            ...req.body,
            client: req.params.id,
            type: 'paid',
            amount: Number(amount)
        };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Failed to Process Update Transaction" });
    }
}, transaction_controller_1.ClientController.dueCredit);
exports.TransactionRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const http_status_codes_1 = require("http-status-codes");
const transaction_service_1 = require("./transaction.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const addCredit = (0, catchAsync_1.default)(async (req, res, next) => {
    await transaction_service_1.TransactionService.addCreditToDB(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Transaction made successfully',
    });
});
const dueCredit = (0, catchAsync_1.default)(async (req, res, next) => {
    await transaction_service_1.TransactionService.dueCreditToDB(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Transaction made successfully',
    });
});
const retrieveTransactions = (0, catchAsync_1.default)(async (req, res) => {
    const result = await transaction_service_1.TransactionService.retrieveTransactionsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Retrieved transactions successfully',
        data: result
    });
});
const clientTransaction = (0, catchAsync_1.default)(async (req, res) => {
    const result = await transaction_service_1.TransactionService.clientTransactionFromDB(req.params.id, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Retrieved Client Info and transactions successfully',
        data: result
    });
});
const transactionStatistics = (0, catchAsync_1.default)(async (req, res) => {
    const result = await transaction_service_1.TransactionService.transactionStatisticsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Retrieved transactions statistic successfully',
        data: result
    });
});
const updateTransaction = (0, catchAsync_1.default)(async (req, res) => {
    const result = await transaction_service_1.TransactionService.updateTransactionsFromDB(req.params.id, req.body.amount);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Transaction Updated successfully',
        data: result
    });
});
const deleteTransaction = (0, catchAsync_1.default)(async (req, res) => {
    const result = await transaction_service_1.TransactionService.deleteTransactionsFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Transaction Deleted successfully',
        data: result
    });
});
exports.ClientController = {
    addCredit,
    dueCredit,
    retrieveTransactions,
    updateTransaction,
    clientTransaction,
    transactionStatistics,
    deleteTransaction
};

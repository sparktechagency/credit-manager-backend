"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const transaction_model_1 = require("./transaction.model");
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../../helpers/QueryBuilder"));
const client_model_1 = require("../client/client.model");
const addCreditToDB = async (id, payload) => {
    const isExistClient = await client_model_1.Client.findById(id);
    if (!isExistClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Client doesn't exist");
    }
    const updateCredit = isExistClient.credit + payload.amount;
    const addCredit = await client_model_1.Client.findOneAndUpdate({ _id: id }, { credit: updateCredit }, {
        new: true,
    });
    if (!addCredit) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to add credit to client');
    }
    const transaction = await transaction_model_1.Transaction.create(payload);
    if (!transaction) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to make transaction');
    }
    return transaction;
};
const dueCreditToDB = async (id, payload) => {
    const isExistClient = await client_model_1.Client.findById(id);
    if (!isExistClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Client doesn't exist");
    }
    const updateCredit = Number(isExistClient.credit) - Number(payload.amount);
    const addCredit = await client_model_1.Client.findOneAndUpdate({ _id: id }, { credit: updateCredit }, {
        new: true,
    });
    if (!addCredit) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to add credit to client');
    }
    const transaction = await transaction_model_1.Transaction.create(payload);
    if (!transaction) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to make transaction');
    }
    return transaction;
};
const retrieveTransactionsFromDB = async (query) => {
    var _a, _b, _c, _d;
    const { fromDate, toDate } = query;
    let match = {};
    if (fromDate) {
        const parsedFromDate = new Date(fromDate);
        if (isNaN(parsedFromDate.getTime())) {
            throw new Error('Invalid fromDate format.');
        }
        const start = new Date(parsedFromDate);
        start.setUTCHours(0, 0, 0, 0);
        let endDate = toDate || fromDate;
        const parsedToDate = new Date(endDate);
        if (toDate && isNaN(parsedToDate.getTime())) {
            throw new Error('Invalid toDate format.');
        }
        const end = new Date(parsedToDate);
        end.setUTCHours(23, 59, 59, 999);
        match.createdAt = { $gte: start, $lte: end };
    }
    const TransactionQuery = new QueryBuilder_1.default(transaction_model_1.Transaction.find().sort({ createdAt: -1 }), query)
        .paginate()
        .filter(match);
    const [transactions, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate("client")
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);
    const result = await Promise.all(transactions.map(async (transaction) => {
        var _a, _b, _c, _d;
        const credit = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: (_a = transaction.client) === null || _a === void 0 ? void 0 : _a._id,
                    type: "credit",
                }
            },
            {
                $group: {
                    _id: null,
                    totalCredit: { $sum: "$amount" }
                }
            }
        ]);
        const paid = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: (_b = transaction.client) === null || _b === void 0 ? void 0 : _b._id,
                    type: "paid",
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$amount" }
                }
            }
        ]);
        const balance = Number(((_c = credit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit) || 0) - Number(((_d = paid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid) || 0);
        return {
            ...transaction,
            balance
        };
    }));
    const credit = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "credit",
            }
        },
        {
            $group: {
                _id: null,
                totalCredit: { $sum: "$amount" }
            }
        }
    ]);
    const paid = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "paid",
            }
        },
        {
            $group: {
                _id: null,
                totalPaid: { $sum: "$amount" }
            }
        }
    ]);
    const data = {
        transactions: result,
        totalCredit: ((_a = credit[0]) === null || _a === void 0 ? void 0 : _a.totalCredit) || 0,
        totalPaid: ((_b = paid[0]) === null || _b === void 0 ? void 0 : _b.totalPaid) || 0,
        balance: Number(((_c = credit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit) || 0) - Number(((_d = paid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid) || 0),
        pagination
    };
    return data;
};
const clientTransactionFromDB = async (id, query) => {
    var _a, _b, _c, _d;
    const isExistClient = await client_model_1.Client.findById(id).lean().exec();
    if (!isExistClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Client');
    }
    const { fromDate, toDate } = query;
    let match = {};
    if (fromDate) {
        const parsedFromDate = new Date(fromDate);
        if (isNaN(parsedFromDate.getTime())) {
            throw new Error('Invalid fromDate format.');
        }
        const start = new Date(parsedFromDate);
        start.setUTCHours(0, 0, 0, 0);
        let endDate = toDate || fromDate;
        const parsedToDate = new Date(endDate);
        if (toDate && isNaN(parsedToDate.getTime())) {
            throw new Error('Invalid toDate format.');
        }
        const end = new Date(parsedToDate);
        end.setUTCHours(23, 59, 59, 999);
        match.createdAt = { $gte: start, $lte: end };
    }
    const ClientTransactionQuery = new QueryBuilder_1.default(transaction_model_1.Transaction.find({ client: id }).sort({ createdAt: -1 }), query)
        .filter(match)
        .paginate()
        .search(["name", "email", "contact", "type"]);
    const [transactions, pagination] = await Promise.all([
        ClientTransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        ClientTransactionQuery.getPaginationInfo(),
    ]);
    const result = await Promise.all(transactions.map(async (transaction) => {
        var _a, _b;
        const credit = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: transaction.client,
                    type: "credit",
                }
            },
            {
                $group: {
                    _id: null,
                    totalCredit: { $sum: "$amount" }
                }
            }
        ]);
        const paid = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: transaction.client,
                    type: "paid",
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$amount" }
                }
            }
        ]);
        const balance = Number(((_a = credit[0]) === null || _a === void 0 ? void 0 : _a.totalCredit) || 0) - Number(((_b = paid[0]) === null || _b === void 0 ? void 0 : _b.totalPaid) || 0);
        return {
            ...transaction,
            balance
        };
    }));
    const credit = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                client: new mongoose_1.default.Types.ObjectId(id),
                type: "credit",
            }
        },
        {
            $group: {
                _id: null,
                totalCredit: { $sum: "$amount" }
            }
        }
    ]);
    const paid = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                client: new mongoose_1.default.Types.ObjectId(id),
                type: "paid",
            }
        },
        {
            $group: {
                _id: null,
                totalPaid: { $sum: "$amount" }
            }
        }
    ]);
    const balance = Number(((_a = credit[0]) === null || _a === void 0 ? void 0 : _a.totalCredit) || 0) - Number(((_b = paid[0]) === null || _b === void 0 ? void 0 : _b.totalPaid) || 0);
    const client = {
        ...isExistClient,
        transactions: result,
        totalCredit: ((_c = credit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit) || 0,
        totalPaid: ((_d = paid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid) || 0,
        balance,
        pagination
    };
    return client;
};
const transactionStatisticsFromDB = async () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Initialize array with 0 values
    const transactionStatisticsArray = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        credit: 0,
        paid: 0,
    }));
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    // Credit analytics
    const creditAnalytics = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "credit",
                createdAt: { $gte: startOfYear, $lt: endOfYear }
            }
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);
    // Paid analytics
    const paidAnalytics = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "paid",
                createdAt: { $gte: startOfYear, $lt: endOfYear }
            }
        },
        {
            $group: {
                _id: { month: { $month: "$createdAt" } },
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);
    // Populate credit statistics
    creditAnalytics.forEach(stat => {
        const monthIndex = stat._id.month - 1;
        transactionStatisticsArray[monthIndex].credit = stat.totalAmount;
    });
    // Populate paid statistics
    paidAnalytics.forEach(stat => {
        const monthIndex = stat._id.month - 1;
        transactionStatisticsArray[monthIndex].paid = stat.totalAmount;
    });
    return transactionStatisticsArray;
};
const deleteTransactionsFromDB = async (id) => {
    const deletedTransaction = await transaction_model_1.Transaction.findByIdAndDelete(id).lean().exec();
    if (!deletedTransaction) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Transaction not found");
    }
    return deletedTransaction;
};
const updateTransactionsFromDB = async (id, amount) => {
    const updatedTransaction = await transaction_model_1.Transaction.findByIdAndUpdate(id, { $set: { amount } }, { new: true, lean: true }).exec();
    if (!updatedTransaction) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Transaction not found");
    }
    return updatedTransaction;
};
exports.TransactionService = {
    addCreditToDB,
    dueCreditToDB,
    retrieveTransactionsFromDB,
    clientTransactionFromDB,
    transactionStatisticsFromDB,
    updateTransactionsFromDB,
    deleteTransactionsFromDB
};

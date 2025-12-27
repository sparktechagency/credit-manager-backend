"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const client_model_1 = require("./client.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../../helpers/QueryBuilder"));
const transaction_model_1 = require("../transaction/transaction.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../../config"));
const user_model_1 = require("../user/user.model");
const createClientToDB = async (payload) => {
    const createClient = await client_model_1.Client.create(payload);
    if (!createClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Client');
    }
    return createClient;
};
const retrieveClientsFromDB = async (query) => {
    const TransactionQuery = new QueryBuilder_1.default(client_model_1.Client.find(), query)
        .paginate()
        .filter()
        .search(["name", "email", "address", "contact"]);
    const [clients, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);
    const result = await Promise.all(clients.map(async (client) => {
        var _a, _b, _c, _d;
        const credit = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: client._id,
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
                    client: client._id,
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
            ...client,
            balance,
            totalCredit: ((_c = credit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit) || 0,
            totalPaid: ((_d = paid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid) || 0
        };
    }));
    return { clients: result, pagination };
};
const retrieveActiveClientsFromDB = async (query) => {
    const TransactionQuery = new QueryBuilder_1.default(client_model_1.Client.find({ status: "active" }), query).paginate();
    const [clients, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);
    const result = await Promise.all(clients.map(async (client) => {
        var _a, _b, _c, _d;
        const credit = await transaction_model_1.Transaction.aggregate([
            {
                $match: {
                    client: client._id,
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
                    client: client._id,
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
            ...client,
            balance,
            totalCredit: ((_c = credit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit) || 0,
            totalPaid: ((_d = paid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid) || 0
        };
    }));
    return { clients: result, pagination };
};
const transactionSummaryFromDB = async () => {
    var _a, _b, _c, _d;
    const today = new Date();
    const start = new Date(today);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setUTCHours(23, 59, 59, 999);
    const dateMatch = {
        createdAt: { $gte: start, $lte: end }
    };
    const clientsIDs = await client_model_1.Client.find({ status: "active" }).distinct("_id");
    // Total Credit
    const credit = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "credit",
                ...dateMatch
            }
        },
        {
            $group: {
                _id: null,
                totalCredit: { $sum: "$amount" }
            }
        }
    ]);
    const totalCredit = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "credit"
            }
        },
        {
            $group: {
                _id: null,
                totalCredit: { $sum: "$amount" }
            }
        }
    ]);
    // Total Paid
    const paid = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "paid",
                ...dateMatch
            }
        },
        {
            $group: {
                _id: null,
                totalPaid: { $sum: "$amount" }
            }
        }
    ]);
    const totalPaid = await transaction_model_1.Transaction.aggregate([
        {
            $match: {
                type: "paid"
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
        totalClient: (clientsIDs === null || clientsIDs === void 0 ? void 0 : clientsIDs.length) || 0,
        totalCredit: (credit === null || credit === void 0 ? void 0 : credit.length) > 0 ? (_a = credit[0]) === null || _a === void 0 ? void 0 : _a.totalCredit : 0 || 0,
        totalPaid: (paid === null || paid === void 0 ? void 0 : paid.length) > 0 ? (_b = paid[0]) === null || _b === void 0 ? void 0 : _b.totalPaid : 0 || 0,
        balance: ((totalCredit === null || totalCredit === void 0 ? void 0 : totalCredit.length) > 0 ? (_c = totalCredit[0]) === null || _c === void 0 ? void 0 : _c.totalCredit : 0) - ((totalPaid === null || totalPaid === void 0 ? void 0 : totalPaid.length) > 0 ? (_d = totalPaid[0]) === null || _d === void 0 ? void 0 : _d.totalPaid : 0) || 0
    };
    return data;
};
const updateClientProfileToDB = async (client, payload) => {
    const id = new mongoose_1.default.Types.ObjectId(client);
    const isExistUser = await client_model_1.Client.findById(id);
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }
    const updateDoc = await client_model_1.Client.findOneAndUpdate({ _id: id }, payload, { new: true });
    return updateDoc;
};
const deactivedClientToDB = async (id) => {
    const isExistUser = await client_model_1.Client.findById(id).lean().exec();
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }
    const status = isExistUser.status === "active" ? "inactive" : "active";
    const updateDoc = await client_model_1.Client.findOneAndUpdate({ _id: id }, { $set: { status: status } }, { new: true });
    if (!updateDoc) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update client");
    }
    return updateDoc;
};
const clientStatisticsFromDB = async () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Initialize user statistics array with 0 counts
    const clientStatisticsArray = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        clients: 0
    }));
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const clientsAnalytics = await client_model_1.Client.aggregate([
        {
            $match: {
                status: "active",
                createdAt: { $gte: startOfYear, $lt: endOfYear }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" }
                },
                total: { $sum: 1 }
            }
        }
    ]);
    // Populate statistics array
    clientsAnalytics.forEach(stat => {
        const monthIndex = stat._id.month - 1;
        clientStatisticsArray[monthIndex].clients = stat.total;
    });
    return clientStatisticsArray;
};
const deleteClientFromDB = async (id) => {
    const createClient = await client_model_1.Client.findByIdAndDelete(id);
    if (!createClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete Client');
    }
    return createClient;
};
const changeClientPasswordToDB = async (user, payload) => {
    const { newPassword, confirmPassword } = payload;
    const isExistUser = await client_model_1.Client.findById(user).select('+password');
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }
    //new password and confirm password check
    if (newPassword !== confirmPassword) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password and Confirm password doesn't matched");
    }
    //hash password
    const hashPassword = await bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateData = {
        password: hashPassword,
    };
    await client_model_1.Client.findOneAndUpdate({ _id: user }, updateData, { new: true });
};
const loginClientFromDB = async (payload) => {
    const { username, password } = payload;
    const isExistClient = await client_model_1.Client.findOne({ username: username }).select('+password');
    if (!isExistClient) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //check verified and status
    if (isExistClient === "inactive") {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please contact with admin to activate your account!');
    }
    //check match password
    if (password && !(await user_model_1.User.isMatchPassword(password, isExistClient.password))) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is incorrect!');
    }
    return isExistClient;
};
exports.ClientService = {
    createClientToDB,
    retrieveClientsFromDB,
    updateClientProfileToDB,
    transactionSummaryFromDB,
    deactivedClientToDB,
    clientStatisticsFromDB,
    retrieveActiveClientsFromDB,
    deleteClientFromDB,
    changeClientPasswordToDB,
    loginClientFromDB
};

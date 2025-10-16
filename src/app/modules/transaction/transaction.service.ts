import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ITransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import mongoose, { FilterQuery } from 'mongoose';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { Client } from "../client/client.model";


const addCreditToDB = async (id: string, payload: ITransaction): Promise<ITransaction> => {

    const isExistClient = await Client.findById(id);

    if (!isExistClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist");
    }

    const updateCredit = isExistClient.credit + payload.amount;


    const addCredit = await Client.findOneAndUpdate({ _id: id }, { credit: updateCredit }, {
        new: true,
    })

    if (!addCredit) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add credit to client');
    }

    const transaction = await Transaction.create(payload);
    if (!transaction) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to make transaction');
    }

    return transaction;
};


const dueCreditToDB = async (id: string, payload: ITransaction): Promise<ITransaction> => {

    const isExistClient = await Client.findById(id);

    if (!isExistClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist");
    }

    const updateCredit = Number(isExistClient.credit) - Number(payload.amount);

    const addCredit = await Client.findOneAndUpdate({ _id: id }, { credit: updateCredit }, {
        new: true,
    })

    if (!addCredit) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add credit to client');
    }

    const transaction = await Transaction.create(payload);
    if (!transaction) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to make transaction');
    }

    return transaction;
};

const retrieveTransactionsFromDB = async (query: FilterQuery<any>): Promise<{}> => {

    const { fromDate, toDate } = query;

    let match: any = {};

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

    const TransactionQuery = new QueryBuilder(
        Transaction.find().sort({ createdAt: -1 }),
        query
    )
        .paginate()
        .filter(match)

    const [transactions, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate("client")
            .lean()
            .exec()
        ,
        TransactionQuery.getPaginationInfo(),
    ]);


    const result = await Promise.all(transactions.map(async (transaction: ITransaction) => {
        const credit = await Transaction.aggregate([
            {
                $match: {
                    client: transaction.client?._id,
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

        const paid = await Transaction.aggregate([
            {
                $match: {
                    client: transaction.client?._id,
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

        const balance = Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0);

        return {
            ...transaction,
            balance
        }
    }))

    const credit = await Transaction.aggregate([
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

    const paid = await Transaction.aggregate([
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
        totalCredit: credit[0]?.totalCredit || 0,
        totalPaid: paid[0]?.totalPaid || 0,
        balance: Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0),
        pagination
    }

    return data
};

const clientTransactionFromDB = async (id: string, query: FilterQuery<any>): Promise<object> => {

    const isExistClient = await Client.findById(id).lean().exec();
    if (!isExistClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Client');
    }


    const { fromDate, toDate } = query;

    let match: any = {};

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

    const ClientTransactionQuery = new QueryBuilder(
        Transaction.find({ client: id }).sort({ createdAt: -1 }),
        query
    )
        .filter(match)
        .paginate()
        .search(["name", "email", "contact", "type"])

    const [transactions, pagination] = await Promise.all([
        ClientTransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        ClientTransactionQuery.getPaginationInfo(),
    ]);

    const result = await Promise.all(transactions.map(async (transaction: ITransaction) => {
        const credit = await Transaction.aggregate([
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

        const paid = await Transaction.aggregate([
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

        const balance = Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0);

        return {
            ...transaction,
            balance
        }
    }))

    const credit = await Transaction.aggregate([
        {
            $match: {
                client: new mongoose.Types.ObjectId(id),
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

    const paid = await Transaction.aggregate([
        {
            $match: {
                client: new mongoose.Types.ObjectId(id),
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

    const balance = Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0);

    const client = {
        ...isExistClient,
        transactions: result,
        totalCredit: credit[0]?.totalCredit || 0,
        totalPaid: paid[0]?.totalPaid || 0,
        balance,
        pagination
    }

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
    const creditAnalytics = await Transaction.aggregate([
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
    const paidAnalytics = await Transaction.aggregate([
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


const deleteTransactionsFromDB = async (id: string): Promise<ITransaction> => {
    const deletedTransaction = await Transaction.findByIdAndDelete(id).lean().exec();

    if (!deletedTransaction) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Transaction not found");
    }

    return deletedTransaction;
};


const updateTransactionsFromDB = async (id: string, amount: number): Promise<ITransaction> => {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        { $set: { amount } },
        { new: true, lean: true }
    ).exec();

    if (!updatedTransaction) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Transaction not found");
    }

    return updatedTransaction;
};


export const TransactionService = {
    addCreditToDB,
    dueCreditToDB,
    retrieveTransactionsFromDB,
    clientTransactionFromDB,
    transactionStatisticsFromDB,
    updateTransactionsFromDB,
    deleteTransactionsFromDB
};
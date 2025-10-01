import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ITransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import { FilterQuery } from 'mongoose';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { Client } from "../client/client.model";
import { IClient } from "../client/client.interface";


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

const retrieveTransactionsFromDB = async (query: FilterQuery<any>): Promise<{ transactions: ITransaction[], pagination: any }> => {

    const TransactionQuery = new QueryBuilder(
        Transaction.find(),
        query
    ).paginate();

    const [transactions, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);

    return { transactions, pagination }
};

const clientTransactionFromDB = async (id: string, query: FilterQuery<any>): Promise<object> => {

    const isExistClient = await Client.findById(id).lean().exec();
    if (!isExistClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Client');
    }

    const ClientTransactionQuery = new QueryBuilder(
        Transaction.find({ client: id }),
        query
    ).paginate();

    const [transactions, pagination] = await Promise.all([
        ClientTransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        ClientTransactionQuery.getPaginationInfo(),
    ]);

    const client = {
        ...isExistClient,
        transactions,
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
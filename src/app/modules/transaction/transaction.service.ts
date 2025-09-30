import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ITransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import { FilterQuery } from 'mongoose';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { Client } from "../client/client.model";


const addCreditToDB = async (id:string, payload: ITransaction): Promise<ITransaction> => {

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


const dueCreditToDB = async (id:string, payload: ITransaction): Promise<ITransaction> => {

    const isExistClient = await Client.findOne({ client: id });

    if (!isExistClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist");
    }

    if(isExistClient.credit < payload.amount || isExistClient.credit < 1){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't have sufficient credit");
    }

    const updateCredit = Number(isExistClient.credit) - Number(payload.amount);

    const addCredit = await Client.findOneAndUpdate({ _id: payload.client }, { credit: updateCredit }, {
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

const updateTransactionsToDB = async (id: string, payload: ITransaction): Promise<ITransaction> => {

    const isExistTransaction = await Transaction.findById(id);

    if (!isExistTransaction) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction doesn't exist");
    }

    const updateTransaction = await Transaction.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    })

    if (!updateTransaction) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update transaction');
    }

    return updateTransaction
};

export const TransactionService = {
    addCreditToDB,
    dueCreditToDB,
    retrieveTransactionsFromDB,
    updateTransactionsToDB
};
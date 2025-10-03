import { IClient } from "./client.interface";
import { JwtPayload } from 'jsonwebtoken';
import { Client } from "./client.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import unlinkFile from "../../../shared/unlinkFile";
import mongoose, { FilterQuery, mongo } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";
import { Transaction } from "../transaction/transaction.model";

const createClientToDB = async (payload: Partial<IClient>): Promise<IClient> => {

    const createClient = await Client.create(payload);
    if (!createClient) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Client');
    }

    return createClient;
};

const retrieveClientsFromDB = async (query: FilterQuery<any>): Promise<{ clients: IClient[], pagination: any }> => {

    const TransactionQuery = new QueryBuilder(
        Client.find(),
        query
    )
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


    const result = await Promise.all(clients.map(async (client: IClient) => {
        const credit = await Transaction.aggregate([
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
        const paid = await Transaction.aggregate([
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
        const balance = Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0);
        return {
            ...client,
            balance,
            totalCredit: credit[0]?.totalCredit || 0,
            totalPaid: paid[0]?.totalPaid || 0
        }
    }))


    return { clients: result, pagination }
};

const retrieveActiveClientsFromDB = async (query: FilterQuery<any>): Promise<{ clients: IClient[], pagination: any }> => {

    const TransactionQuery = new QueryBuilder(
        Client.find({status: "active"}),
        query
    ).paginate();

    const [clients, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);


    const result = await Promise.all(clients.map(async (client: IClient) => {
        const credit = await Transaction.aggregate([
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
        const paid = await Transaction.aggregate([
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
        const balance = Number(credit[0]?.totalCredit || 0) - Number(paid[0]?.totalPaid || 0);
        return {
            ...client,
            balance,
            totalCredit: credit[0]?.totalCredit || 0,
            totalPaid: paid[0]?.totalPaid || 0
        }
    }))


    return { clients: result, pagination }
};

const transactionSummaryFromDB = async (): Promise<{ totalCredit: number, balance: number, totalPaid: number }> => {

    const clientsIDs = await Client.find({ status: "active" }).distinct("_id");

    // Total Credit
    const credit = await Transaction.aggregate([
        {
            $match: {
                client: { $in: clientsIDs },
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

    // Total Paid
    const paid = await Transaction.aggregate([
        {
            $match: {
                client: { $in: clientsIDs },
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
        totalClient: clientsIDs?.length || 0,
        totalCredit: credit?.length > 0 ? credit[0]?.totalCredit : 0 || 0,
        totalPaid: paid?.length > 0 ? paid[0]?.totalPaid : 0 || 0,
        balance: (credit?.length > 0 ? credit[0]?.totalCredit : 0) - (paid?.length > 0 ? paid[0]?.totalPaid : 0) || 0
    }

    return data;
}


const updateClientProfileToDB = async (client: string, payload: Partial<IClient>): Promise<Partial<IClient | null>> => {
    const id = new mongoose.Types.ObjectId(client);
    const isExistUser = await Client.findById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }

    const updateDoc = await Client.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );

    return updateDoc;
};

const deactivedClientToDB = async (id: string): Promise<IClient> => {

    const isExistUser = await Client.findById(id).lean().exec();
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }

    const status = isExistUser.status === "active" ? "inactive" : "active"

    const updateDoc = await Client.findOneAndUpdate(
        { _id: id },
        { $set: { status: status } },
        { new: true }
    );

    if (!updateDoc) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update client");
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

    const clientsAnalytics = await Client.aggregate([
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

export const ClientService = {
    createClientToDB,
    retrieveClientsFromDB,
    updateClientProfileToDB,
    transactionSummaryFromDB,
    deactivedClientToDB,
    clientStatisticsFromDB,
    retrieveActiveClientsFromDB
};
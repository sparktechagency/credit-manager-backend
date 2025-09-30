import { IClient} from "./client.interface";
import { JwtPayload } from 'jsonwebtoken';
import { Client } from "./client.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import unlinkFile from "../../../shared/unlinkFile";
import { FilterQuery } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";

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
    ).paginate();

    const [clients, pagination] = await Promise.all([
        TransactionQuery.queryModel
            .populate()
            .lean()
            .exec(),
        TransactionQuery.getPaginationInfo(),
    ]);


    return { clients, pagination }
};

const transactionSummaryFromDB = async (): Promise<{ totalCredit: number, balance: number, totalPaid: number }> => {

    const summary = await Client.aggregate([
        {
            $group: {
                _id: null,
                totalCredit: { $sum: "$credit" },
                totalPaid: { $sum: "$paid" }
            }
        }
    ]);
    return {
        totalCredit: summary[0]?.totalCredit || 0,
        totalPaid: summary[0]?.totalPaid || 0,
        balance: (summary[0]?.totalCredit || 0) - (summary[0]?.totalPaid || 0)
    };
}

const updateClientProfileToDB = async (client: JwtPayload, payload: Partial<IClient>): Promise<Partial<IClient | null>> => {

    const isExistUser = await Client.findById(client.id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Client doesn't exist!");
    }

    //unlink file here
    if (payload.profile) {
        unlinkFile(isExistUser.profile);
    }

    const updateDoc = await Client.findOneAndUpdate(
        { _id: client.id },
        payload,
        { new: true }
    );

    return updateDoc;
};

export const ClientService = {
    createClientToDB,
    retrieveClientsFromDB,
    updateClientProfileToDB,
    transactionSummaryFromDB
};
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Currency } from "./currency.model";
import { ICurrency } from "./currency.interface";


const addCurrencyToDB = async (payload: ICurrency): Promise<ICurrency> => {

    const isExist = await Currency.findOne();
    if (!isExist) {
        const created = await Currency.create({
            rate: payload.rate
        });
        return created as ICurrency;
    }

    isExist.rate = payload.rate;
    const currecy = await isExist.save();
    if (!currecy) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update currency');
    }

    return isExist as ICurrency;
};

const retrieveCurrencyFromDB = async (): Promise<ICurrency> => {
    const currency = await Currency.findOne();
    return currency!;
};

export const CurrecyService = {
    addCurrencyToDB,
    retrieveCurrencyFromDB
};
import { Model, Types } from 'mongoose';

export type ICurrency = {
    _id?: Types.ObjectId;
    rate: string;
}

export type CurrencyModel = Model<ICurrency>;
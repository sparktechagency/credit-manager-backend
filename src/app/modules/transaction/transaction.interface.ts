import { Model, Types } from 'mongoose';

export type ITransaction = {
    _id?: Types.ObjectId;
    client: Types.ObjectId;
    amount: number;
    type: 'credit' | 'paid';
    description?: string;
}

export type TransactionModel = Model<ITransaction>;
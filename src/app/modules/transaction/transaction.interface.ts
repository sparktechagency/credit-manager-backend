import { Model, Types } from 'mongoose';

export type ITransaction = {
    _id?: Types.ObjectId;
    client: Types.ObjectId;
    notes?: string;
    amount: number;
    type: 'credit' | 'paid';
    txid: string;
    description?: string;
}

export type TransactionModel = Model<ITransaction>;
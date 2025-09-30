import { Schema, model } from 'mongoose';
import { ITransaction, TransactionModel } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
    {
        client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'paid'], required: true },
        description: { type: String }
    },
    {
        timestamps: true
    }
);

export const Transaction = model<ITransaction, TransactionModel>('Transaction', transactionSchema);
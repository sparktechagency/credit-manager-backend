import { Schema, model } from 'mongoose';
import { ITransaction, TransactionModel } from './transaction.interface';
import { randomBytes } from 'crypto';

const transactionSchema = new Schema<ITransaction>(
    {
        client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        amount: { type: Number, required: true },
        txid: {type: String, required: false},
        notes: {type: String, required: false},
        type: { type: String, enum: ['credit', 'paid'], required: true },
        description: { type: String }
    },
    {
        timestamps: true
    }
);


transactionSchema.pre('save', async function (next) {

    if (!this.txid) {
        const prefix = "tx"
        const uniqueId = randomBytes(8).toString("hex");
        this.txid =  `${prefix}_${uniqueId}`;
    }
    next();
});


export const Transaction = model<ITransaction, TransactionModel>('Transaction', transactionSchema);
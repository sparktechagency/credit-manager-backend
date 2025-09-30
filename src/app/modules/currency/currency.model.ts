import { Schema, model } from 'mongoose';
import { ICurrency, CurrencyModel } from './currency.interface';

const CurrencySchema = new Schema<ICurrency>(
    {
        rate: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Currency = model<ICurrency, CurrencyModel>('Currency', CurrencySchema);
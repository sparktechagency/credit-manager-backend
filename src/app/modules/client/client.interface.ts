import { Model, Types } from 'mongoose';

export type IClient = {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    address: string;
    credit: number;
    paid: number;
    contact: string;
    userId: string;
    notes?: string;
    password: string;
    profile: string;
    status: 'active' | 'inactive';
}

export type ClientModel = Model<IClient>;
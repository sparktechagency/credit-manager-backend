import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

interface IAuthenticationProps {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
}

export type IUser = {
    _id?: Types.ObjectId;
    name: string;
    appId: string;
    role: USER_ROLES;
    email: string;
    contact: string;
    password: string;
    profile: string;
    verified: boolean;
    authentication?: IAuthenticationProps;
}

export type UserModal = {
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
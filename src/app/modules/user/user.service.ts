import { IUser } from "./user.interface";
import { JwtPayload } from 'jsonwebtoken';
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import unlinkFile from "../../../shared/unlinkFile";
import { Client } from "../client/client.model";

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {

    const createUser = await User.create(payload);
    if (!createUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    //send email
    const otp = generateOTP();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email!
    };

    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };

    await User.findOneAndUpdate(
        { _id: createUser._id },
        { $set: { authentication } }
    );

    return createUser;
};

const retrieveProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {

    const isExistUser: any = await User.findById(user.id).lean().exec();
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    
    return isExistUser;
};

const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>): Promise<Partial<IUser | null>> => {

    const isExistUser = await User.findById(user.id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //unlink file here
    if (payload.profile) {
        unlinkFile(isExistUser.profile);
    }

    const updateDoc = await User.findOneAndUpdate(
        { _id: user.id },
        payload,
        { new: true }
    );

    return updateDoc;
};

const checkUsernameFromDB = async (username: string): Promise<IUser | null> => {

    const createUser = await Client.findOne({ username });
    if (createUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Username is already taken');
    }

    return createUser;
};

export const UserService = {
    createUserToDB,
    retrieveProfileFromDB,
    updateProfileToDB,
    checkUsernameFromDB
};
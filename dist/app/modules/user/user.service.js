"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const client_model_1 = require("../client/client.model");
const createUserToDB = async (payload) => {
    const createUser = await user_model_1.User.create(payload);
    if (!createUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    await user_model_1.User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return createUser;
};
const retrieveProfileFromDB = async (user) => {
    const isExistUser = await user_model_1.User.findById(user.id).lean().exec();
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
};
const updateProfileToDB = async (user, payload) => {
    const isExistUser = await user_model_1.User.findById(user.id);
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //unlink file here
    if (payload.profile) {
        (0, unlinkFile_1.default)(isExistUser.profile);
    }
    const updateDoc = await user_model_1.User.findOneAndUpdate({ _id: user.id }, payload, { new: true });
    return updateDoc;
};
const checkUsernameFromDB = async (username) => {
    const createUser = await client_model_1.Client.findOne({ username });
    if (createUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Username is already taken');
    }
    return createUser;
};
exports.UserService = {
    createUserToDB,
    retrieveProfileFromDB,
    updateProfileToDB,
    checkUsernameFromDB
};

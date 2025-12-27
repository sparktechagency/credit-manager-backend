"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_service_1 = require("./user.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
// register user
const createUser = (0, catchAsync_1.default)(async (req, res, next) => {
    await user_service_1.UserService.createUserToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Your account has been successfully created. Verify Your Email By OTP. Check your email',
    });
});
// register user
const checkUsername = (0, catchAsync_1.default)(async (req, res, next) => {
    await user_service_1.UserService.checkUsernameFromDB(req.body.username);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Username is available',
    });
});
// retrieved user profile
const retrieveProfile = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.retrieveProfileFromDB(req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result
    });
});
//update profile
const updateProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await user_service_1.UserService.updateProfileToDB(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});
exports.UserController = {
    createUser,
    retrieveProfile,
    updateProfile,
    checkUsername
};

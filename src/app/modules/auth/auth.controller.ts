import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmailToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUserFromDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User login successfully',
        data: result
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.forgetPasswordToDB(req.body.email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Please check your email, we send a OTP!',
        data: result
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.resetPasswordToDB(req.headers.authorization!, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password reset successfully',
        data: result
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.changePasswordToDB(req.user, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password changed successfully',
    });
});


const newAccessToken = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.newAccessTokenToUser(req.body.refreshToken);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Generate Access Token successfully',
        data: result
    });
});

const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.resendVerificationEmailToDB(req.body.email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Generate OTP and send successfully',
        data: result
    });
});

// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.deleteUserFromDB(req.user, req.body.password);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Account Deleted successfully',
        data: result
    });
});

export const AuthController = {
    verifyEmail,
    loginUser,
    forgetPassword,
    resetPassword,
    changePassword,
    newAccessToken,
    resendVerificationEmail,
    deleteUser
};
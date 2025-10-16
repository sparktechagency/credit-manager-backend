import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';

// register user
const createUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await UserService.createUserToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Your account has been successfully created. Verify Your Email By OTP. Check your email',
    })
});

// register user
const checkUsername = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await UserService.checkUsernameFromDB(req.body.username);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Username is available',
    })
});

// retrieved user profile
const retrieveProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.retrieveProfileFromDB(req.user as JwtPayload,);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result
    });
});

//update profile
const updateProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateProfileToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});

export const UserController = { 
    createUser,
    retrieveProfile, 
    updateProfile,
    checkUsername
};
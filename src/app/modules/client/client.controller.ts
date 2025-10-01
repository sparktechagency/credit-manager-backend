import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ClientService } from './client.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';


const createClients = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await ClientService.createClientToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Client Account Created Successfully',
    })
});

const retrieveClients = catchAsync(async (req: Request, res: Response) => {
    const result = await ClientService.retrieveClientsFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Clients retrieved successfully',
        data: result.clients,
        pagination: result.pagination
    });
});

const retrieveSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await ClientService.transactionSummaryFromDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Transaction summary retrieved successfully',
        data: result
    });
});

const updateClientProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClientService.updateClientProfileToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});


const deactivedClient = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClientService.deactivedClientToDB(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Active successfully',
        data: result
    });
});

const clientStatics = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClientService.clientStatisticsFromDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Client Statistic Retrieved',
        data: result
    });
});

const activeClientStatics = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClientService.retrieveActiveClientsFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Client Statistic Retrieved',
        data: result
    });
});

export const ClientController = { 
    createClients,
    retrieveClients, 
    updateClientProfile,
    retrieveSummary,
    deactivedClient,
    clientStatics,
    activeClientStatics
};
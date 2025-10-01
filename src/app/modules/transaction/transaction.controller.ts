import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TransactionService } from './transaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';


const addCredit = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await TransactionService.addCreditToDB(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Transaction made successfully',
    })
});

const dueCredit = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await TransactionService.dueCreditToDB(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Transaction made successfully',
    })
});

const retrieveTransactions = catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.retrieveTransactionsFromDB(req.user as JwtPayload,);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrieved transactions successfully',
        data: result
    });
});

const updateTransaction = catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.updateTransactionsToDB(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrieved transactions successfully',
        data: result
    });
});

const clientTransaction = catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.clientTransactionFromDB(req.params.id, req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrieved Client Info and transactions successfully',
        data: result
    });
});

const transactionStatistics = catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.transactionStatisticsFromDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Retrieved transactions statistic successfully',
        data: result
    });
});



export const ClientController = { 
    addCredit,
    dueCredit,
    retrieveTransactions,
    updateTransaction,
    clientTransaction,
    transactionStatistics
};
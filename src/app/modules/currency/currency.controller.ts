import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CurrecyService } from "./currency.service";
import { ICurrency } from "./currency.interface";

// Controller to add or update currency
const addCurrency = catchAsync(async (req: Request, res: Response) => {
    const result = await CurrecyService.addCurrencyToDB(req.body);

    sendResponse<ICurrency>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Currency added/updated successfully",
        data: result,
    });
});

// Controller to retrieve currency
const getCurrency = catchAsync(async (req: Request, res: Response) => {
    const result = await CurrecyService.retrieveCurrencyFromDB();

    sendResponse<ICurrency>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Currency retrieved successfully",
        data: result,
    });
});

export const CurrencyController = {
    addCurrency,
    getCurrency
};
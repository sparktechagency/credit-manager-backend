"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const http_status_codes_1 = require("http-status-codes");
const client_service_1 = require("./client.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createClients = (0, catchAsync_1.default)(async (req, res, next) => {
    await client_service_1.ClientService.createClientToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client Account Created Successfully',
    });
});
const retrieveClients = (0, catchAsync_1.default)(async (req, res) => {
    const result = await client_service_1.ClientService.retrieveClientsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Clients retrieved successfully',
        data: result.clients,
        pagination: result.pagination
    });
});
const retrieveSummary = (0, catchAsync_1.default)(async (req, res) => {
    const result = await client_service_1.ClientService.transactionSummaryFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Transaction summary retrieved successfully',
        data: result
    });
});
const updateClientProfile = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.updateClientProfileToDB(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});
const deactivedClient = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.deactivedClientToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Active successfully',
        data: result
    });
});
const clientStatics = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.clientStatisticsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client Statistic Retrieved',
        data: result
    });
});
const activeClientStatics = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.retrieveActiveClientsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client Statistic Retrieved',
        data: result
    });
});
const deleteClient = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.deleteClientFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client deleted successfully',
        data: result
    });
});
const changeClientPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.changeClientPasswordToDB(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client password changed successfully',
        data: result
    });
});
const clientLogin = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await client_service_1.ClientService.loginClientFromDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Client logged in successfully',
        data: result
    });
});
exports.ClientController = {
    createClients,
    retrieveClients,
    updateClientProfile,
    retrieveSummary,
    deactivedClient,
    clientStatics,
    activeClientStatics,
    deleteClient,
    changeClientPassword,
    clientLogin
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionZodValidationSchema = void 0;
const zod_1 = require("zod");
const checkValidID_1 = require("../../../shared/checkValidID");
exports.TransactionZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number({ required_error: 'Amount is required' }),
        client: (0, checkValidID_1.checkValidID)("Client ID is required"),
    })
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientZodValidationSchema = void 0;
const zod_1 = require("zod");
exports.ClientZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        username: zod_1.z.string({ required_error: 'Username is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' })
    })
});

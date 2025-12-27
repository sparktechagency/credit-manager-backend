"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const crypto_1 = require("crypto");
const ClientSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        immutable: true,
        unique: true,
        lowercase: true,
    },
    address: {
        type: String,
        required: false
    },
    contact: {
        type: String,
        required: false
    },
    credit: {
        type: Number,
        default: 0
    },
    paid: {
        type: Number,
        default: 0
    },
    userId: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String,
        default: 'https://res.cloudinary.com/dzo4husae/image/upload/v1733459922/zfyfbvwgfgshmahyvfyk.png',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, {
    timestamps: true
});
ClientSchema.pre('save', async function (next) {
    //check user
    if (this.email) {
        const isExist = await exports.Client.findOne({ email: this.email });
        if (isExist) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
    }
    if (!this.userId) {
        const uniqueId = (0, crypto_1.randomBytes)(8).toString("hex");
        this.userId = uniqueId;
    }
    //password hash
    if (this.password) {
        this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    }
    next();
});
exports.Client = (0, mongoose_1.model)("Client", ClientSchema);

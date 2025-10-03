import { model, Schema } from "mongoose";
import { ClientModel, IClient } from "./client.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import { randomBytes } from "crypto";

const ClientSchema = new Schema<IClient, ClientModel>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            immutable: true,
            unique: true,
            lowercase: true,
        },
        address: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
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
    },
    {
        timestamps: true
    }
);


ClientSchema.pre('save', async function (next) {

    //check user
    if (this.email) {
        const isExist = await Client.findOne({ email: this.email });
        if (isExist) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
    }

    if (!this.userId) {
        const uniqueId = randomBytes(8).toString("hex");
        this.userId =  uniqueId;
    }

    //password hash
    if (this.password) {
        this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
    }
    next();
});

export const Client = model<IClient, ClientModel>("Client", ClientSchema);
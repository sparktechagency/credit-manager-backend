"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const transactionSchema = new mongoose_1.Schema({
    client: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    txid: { type: String, required: false },
    notes: { type: String, required: false },
    type: { type: String, enum: ['credit', 'paid'], required: true },
    description: { type: String }
}, {
    timestamps: true
});
transactionSchema.pre('save', async function (next) {
    if (!this.txid) {
        const prefix = "tx";
        const uniqueId = (0, crypto_1.randomBytes)(8).toString("hex");
        this.txid = `${prefix}_${uniqueId}`;
    }
    next();
});
exports.Transaction = (0, mongoose_1.model)('Transaction', transactionSchema);

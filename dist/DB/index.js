"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const user_model_1 = require("../app/modules/user/user.model");
const config_1 = __importDefault(require("../config"));
const user_1 = require("../enums/user");
const logger_1 = require("../shared/logger");
// create super admin data
const superUser = {
    name: 'Super',
    role: user_1.USER_ROLES.SUPER_ADMIN,
    email: config_1.default.admin.email,
    password: config_1.default.admin.password,
    verified: true
};
const seedSuperAdmin = async () => {
    // check super admin exist or not
    const isExistSuperAdmin = await user_model_1.User.findOne({
        role: user_1.USER_ROLES.SUPER_ADMIN,
    });
    // create super admin
    if (!isExistSuperAdmin) {
        await user_model_1.User.create(superUser);
        logger_1.logger.info(colors_1.default.green('✔ Super admin created successfully!'));
    }
    return;
};
exports.default = seedSuperAdmin;

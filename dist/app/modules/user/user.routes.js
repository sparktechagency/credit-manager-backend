"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router.route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), user_controller_1.UserController.retrieveProfile)
    .post((0, validateRequest_1.default)(user_validation_1.createUserZodValidationSchema), user_controller_1.UserController.createUser)
    .put((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), user_controller_1.UserController.checkUsername)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        const profile = await (0, getFilePath_1.getSingleFilePath)(req.files, "image");
        req.body = { ...req.body, profile };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Failed to Process Update Profile" });
    }
}, user_controller_1.UserController.updateProfile);
exports.UserRoutes = router;

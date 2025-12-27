"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const client_controller_1 = require("./client.controller");
const client_validation_1 = require("./client.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
const getFilePath_1 = require("../../../shared/getFilePath");
const router = express_1.default.Router();
router.route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.retrieveClients)
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(client_validation_1.ClientZodValidationSchema), client_controller_1.ClientController.createClients)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.USER), (0, fileUploaderHandler_1.default)(), async (req, res, next) => {
    try {
        const profile = await (0, getFilePath_1.getSingleFilePath)(req.files, "image");
        req.body = { ...req.body, profile };
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Failed to Process Update Profile" });
    }
}, client_controller_1.ClientController.updateClientProfile);
router.post('/login', client_controller_1.ClientController.clientLogin);
router.route('/summary')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.retrieveSummary);
router.route('/statistic')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.clientStatics);
router.route('/active-statistic')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.activeClientStatics);
router.route('/:id')
    .post((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.changeClientPassword)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.deactivedClient)
    .put((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.updateClientProfile)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN), client_controller_1.ClientController.deleteClient);
exports.ClientRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const error_middleware_1 = require("./middlewares/error.middleware");
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const logger_1 = __importDefault(require("./utils/logger"));
// Import routes
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Security HTTP headers
app.use((0, helmet_1.default)());
// Parse json request body
app.use(express_1.default.json({ limit: '16kb' }));
// Parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true, limit: '16kb' }));
// Gzip compression
app.use((0, compression_1.default)());
// Enable cors
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true,
}));
// HTTP request logger
app.use((0, morgan_1.default)(config_1.config.env === 'development' ? 'dev' : 'combined', {
    stream: { write: (message) => logger_1.default.info(message.trim()) },
}));
// API Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});
app.use('/api/v1', routes_1.default);
// Handle unknown routes
app.use((req, res, next) => {
    next(new ApiError_1.default(404, 'Not Found'));
});
// Global error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * @description Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    if (!(err instanceof ApiError_1.default)) {
        // If not a known ApiError, it's likely a server-side error (500)
        statusCode = 500;
        message = process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error';
    }
    const response = {
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
    if (statusCode >= 500) {
        logger_1.default.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} \nStack: ${err.stack}`);
    }
    else {
        logger_1.default.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;

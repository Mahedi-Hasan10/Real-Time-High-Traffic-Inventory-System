"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
const socket_1 = require("./socket");
const prisma_1 = __importDefault(require("./config/prisma"));
const server = (0, http_1.createServer)(app_1.default);
// Initialize Sockets
(0, socket_1.setupSocket)(server);
const startServer = async () => {
    try {
        // Check DB connection
        await prisma_1.default.$connect();
        logger_1.default.info('Connected to PostgreSQL database via Prisma');
        server.listen(config_1.config.port, () => {
            logger_1.default.info(`Server is running on port ${config_1.config.port} in ${config_1.config.env} mode`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    process.exit(1);
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    logger_1.default.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        logger_1.default.info('💥 Process terminated!');
    });
});

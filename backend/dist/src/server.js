import { createServer } from 'http';
import app from './app.js';
import { config } from './config/index.js';
import logger from './utils/logger.js';
import { setupSocket } from './socket/index.js';
import prisma from './config/prisma.js';
const server = createServer(app);
// Initialize Sockets
setupSocket(server);
const startServer = async () => {
    try {
        // Check DB connection
        await prisma.$connect();
        logger.info('Connected to PostgreSQL database via Prisma');
        server.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        logger.info('💥 Process terminated!');
    });
});

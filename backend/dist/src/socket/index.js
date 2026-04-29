import { Server as SocketServer } from 'socket.io';
import logger from '../utils/logger.js';
export const setupSocket = (server) => {
    const io = new SocketServer(server, {
        cors: {
            origin: '*', // In production, replace with actual origin
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
        // Add more socket handlers here or import them from other files
        socket.on('message', (data) => {
            logger.info(`Message from ${socket.id}: ${data}`);
            io.emit('message', { from: socket.id, message: data });
        });
    });
    return io;
};

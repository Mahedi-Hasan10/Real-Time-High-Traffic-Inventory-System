"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("../utils/logger"));
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // In production, replace with actual origin
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        logger_1.default.info(`User connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger_1.default.info(`User disconnected: ${socket.id}`);
        });
        // Add more socket handlers here or import them from other files
        socket.on('message', (data) => {
            logger_1.default.info(`Message from ${socket.id}: ${data}`);
            io.emit('message', { from: socket.id, message: data });
        });
    });
    return io;
};
exports.setupSocket = setupSocket;

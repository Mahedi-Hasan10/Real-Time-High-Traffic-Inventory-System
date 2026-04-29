"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const createUser = async (data) => {
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new ApiError_1.default(400, 'User with this email already exists');
    }
    return prisma_1.default.user.create({
        data,
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
};
exports.createUser = createUser;
const getUsers = async () => {
    return prisma_1.default.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
};
exports.getUsers = getUsers;

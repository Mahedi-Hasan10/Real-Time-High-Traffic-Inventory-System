import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
export const createUser = async (data) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
    }
    return prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });
};
export const getUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
};

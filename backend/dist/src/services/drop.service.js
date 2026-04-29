import prisma from '../config/prisma.js';
/**
 * @description Create a new merch drop
 */
export const createDrop = async (data) => {
    return prisma.drop.create({
        data: {
            ...data,
            availableStock: data.totalStock,
            startTime: new Date(data.startTime),
        },
    });
};
/**
 * @description Fetch all active drops with the top 3 latest purchasers (Feature 6)
 */
export const getAllDrops = async () => {
    return prisma.drop.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            purchases: {
                take: 3,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            startTime: 'asc',
        },
    });
};

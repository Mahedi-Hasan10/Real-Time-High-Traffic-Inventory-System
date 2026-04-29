import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Create a new merch drop
 */
export const createDrop = async (data: {
  name: string;
  price: number;
  totalStock: number;
  startTime: string;
  description?: string;
}) => {
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

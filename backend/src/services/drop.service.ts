import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { emitStockUpdate, emitNewPurchase } from '../utils/socket.util.js';

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

/**
 * @description Atomic Reservation System (Feature 2)
 * Uses a transaction to prevent overselling.
 */
export const reserveItem = async (dropId: string, userId: string) => {
  const reservation = await prisma.$transaction(async (tx) => {
    // 1. Get drop and check stock (using update to lock the row if needed, 
    // but Prisma's transaction with availableStock check is sufficient here)
    const drop = await tx.drop.findUnique({
      where: { id: dropId },
    });

    if (!drop || drop.availableStock <= 0) {
      throw new ApiError(400, 'Item is sold out or unavailable');
    }

    // 2. Decrease available stock
    const updatedDrop = await tx.drop.update({
      where: { id: dropId },
      data: {
        availableStock: {
          decrement: 1,
        },
      },
    });

    // 3. Create reservation record
    const res = await tx.reservation.create({
      data: {
        userId,
        dropId,
        expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds
      },
    });

    return { reservation: res, availableStock: updatedDrop.availableStock };
  });

  // Notify all clients about stock change
  emitStockUpdate(dropId, reservation.availableStock);

  return reservation.reservation;
};

/**
 * @description Complete Purchase (Feature 4)
 */
export const completePurchase = async (reservationId: string, userId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find the reservation
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { drop: true },
    });

    if (!reservation || reservation.userId !== userId) {
      throw new ApiError(404, 'Reservation not found');
    }

    if (reservation.status !== 'PENDING') {
      throw new ApiError(400, `Reservation is already ${reservation.status}`);
    }

    if (new Date() > reservation.expiresAt) {
      throw new ApiError(400, 'Reservation has expired');
    }

    // 2. Mark reservation as completed
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED' },
    });

    // 3. Create purchase record
    const purchase = await tx.purchase.create({
      data: {
        userId,
        dropId: reservation.dropId,
        amount: reservation.drop.price,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Notify all clients about new purchase (Activity Feed)
    emitNewPurchase(reservation.dropId, purchase.user.name || 'Anonymous');

    return purchase;
  });
};

/**
 * @description Stock Recovery Mechanism (Feature 3)
 * Cleans up expired reservations and returns stock
 */
export const recoverExpiredStock = async () => {
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const res of expiredReservations) {
    try {
      await prisma.$transaction(async (tx) => {
        // Update reservation status
        await tx.reservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        // Increment stock
        const updatedDrop = await tx.drop.update({
          where: { id: res.dropId },
          data: {
            availableStock: {
              increment: 1,
            },
          },
        });

        // Notify clients
        emitStockUpdate(res.dropId, updatedDrop.availableStock);
      });
    } catch (error) {
      console.error(`Failed to recover stock for reservation ${res.id}:`, error);
    }
  }

  return expiredReservations.length;
};

import { io } from '../socket/index.js';

/**
 * @description Emit stock update event to all connected clients
 */
export const emitStockUpdate = (dropId: string, availableStock: number) => {
  if (io) {
    io.emit('stockUpdate', { dropId, availableStock });
  }
};

/**
 * @description Emit new purchase event to update the activity feed
 */
export const emitNewPurchase = (dropId: string, userName: string) => {
  if (io) {
    io.emit('newPurchase', { dropId, userName });
  }
};

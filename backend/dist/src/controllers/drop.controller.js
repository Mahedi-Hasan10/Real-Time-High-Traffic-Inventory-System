import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as dropService from '../services/drop.service.js';
/**
 * @description Initialize a new merch drop
 */
export const initializeDrop = asyncHandler(async (req, res) => {
    const drop = await dropService.createDrop(req.body);
    res.status(201).json(new ApiResponse(201, drop, 'Merch drop initialized successfully'));
});
/**
 * @description Get all active drops for the dashboard
 */
export const getDashboardDrops = asyncHandler(async (req, res) => {
    const drops = await dropService.getAllDrops();
    res.status(200).json(new ApiResponse(200, drops, 'Dashboard data fetched successfully'));
});
/**
 * @description Reserve a drop
 */
export const reserveDrop = asyncHandler(async (req, res) => {
    const { dropId, userId } = req.body;
    const reservation = await dropService.reserveItem(dropId, userId);
    res.status(200).json(new ApiResponse(200, reservation, 'Item reserved successfully. You have 60 seconds.'));
});
/**
 * @description Complete purchase
 */
export const purchaseDrop = asyncHandler(async (req, res) => {
    const { reservationId, userId } = req.body;
    const purchase = await dropService.completePurchase(reservationId, userId);
    res.status(200).json(new ApiResponse(200, purchase, 'Purchase completed successfully'));
});
/**
 * @description Get all reservations for admin
 */
export const getAdminReservations = asyncHandler(async (req, res) => {
    const reservations = await dropService.getReservations();
    res.status(200).json(new ApiResponse(200, reservations, 'Reservations fetched successfully'));
});
/**
 * @description Get my reservations
 */
export const getMyReservations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reservations = await dropService.getUserReservations(userId);
    res.status(200).json(new ApiResponse(200, reservations, 'My reservations fetched successfully'));
});

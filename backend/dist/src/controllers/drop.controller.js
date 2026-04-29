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

import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as userService from '../services/user.service.js';
/**
 * @description Create a new user
 */
export const registerUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});
/**
 * @description Get all users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsers();
    res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description Wrapper for async route handlers to avoid try-catch blocks
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
exports.default = asyncHandler;

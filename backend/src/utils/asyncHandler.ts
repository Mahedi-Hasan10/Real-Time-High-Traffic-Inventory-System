import { Request, Response, NextFunction } from 'express';

/**
 * @description Wrapper for async route handlers to avoid try-catch blocks
 */
const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
    },
  });

  const token = signToken(user.id, user.role);

  res.status(201).json(
    new ApiResponse(201, { user, token }, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  const token = signToken(user.id, user.role);

  res.status(200).json(
    new ApiResponse(200, { user, token }, 'Logged in successfully')
  );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(
    new ApiResponse(200, (req as any).user, 'User profile fetched')
  );
});

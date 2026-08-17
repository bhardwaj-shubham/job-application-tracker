import jwt from "jsonwebtoken";

import prisma from "../config/db.js";
import ERROR_CODES from "../constants/errorCodes.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(
      401,
      "Unauthorized request",
      [],
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid token or token has expired",
      [],
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid token: user no longer exists",
      [],
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  req.user = user;
  next();
});

export default verifyToken;

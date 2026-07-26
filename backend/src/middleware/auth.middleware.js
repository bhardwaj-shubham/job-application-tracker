import jwt from "jsonwebtoken";

import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid token or token has expired");
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
    throw new ApiError(401, "Invalid token: user no longer exists");
  }

  req.user = user;
  next();
});

export default verifyToken;

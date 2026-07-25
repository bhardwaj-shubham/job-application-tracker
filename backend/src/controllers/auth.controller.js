import bcrypt from "bcrypt";

import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Please provide name, email, and password");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPassword = password.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  const checkUserExists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (checkUserExists) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

  const newUser = await prisma.user.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    },
  });

  const { password: _, ...userWithoutPassword } = newUser;

  return res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User created successfully"),
    );
});

export { signupUser };

import bcrypt from "bcrypt";
import ms from "ms";

import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPassword = password.trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    normalizedPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ms(process.env.JWT_EXPIRES_IN || "7d"),
  };

  const { password: _, ...userWithoutPassword } = user;

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, token },
        "User logged in successfully",
      ),
    );
});

export { signupUser, loginUser };

import bcrypt from "bcrypt";
import ms from "ms";

import prisma from "../config/db.js";
import ERROR_CODES from "../constants/errorCodes.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;

  const checkUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (checkUserExists) {
    throw new ApiError(
      409,
      "User already exists",
      [],
      ERROR_CODES.EMAIL_ALREADY_EXISTS,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
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
  const { email, password } = req.validated.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password",
      [],
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password",
      [],
      ERROR_CODES.INVALID_CREDENTIALS,
    );
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

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { signupUser, loginUser, getCurrentUser, logoutUser };

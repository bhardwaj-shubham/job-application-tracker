import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import authLoginRateLimit from "../middleware/rate-limit/authLoginRateLimit.middleware.js";
import authSignupRateLimit from "../middleware/rate-limit/authSignupRateLimit.middleware.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  authSignupRateLimit,
  validate(signupSchema),
  signupUser,
);
authRouter.post("/login", authLoginRateLimit, validate(loginSchema), loginUser);
authRouter.get("/me", verifyToken, getCurrentUser);
authRouter.post("/logout", verifyToken, logoutUser);

export default authRouter;

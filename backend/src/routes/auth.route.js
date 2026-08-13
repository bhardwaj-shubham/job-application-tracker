import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", validate(signupSchema), signupUser);
authRouter.post("/login", validate(loginSchema), loginUser);
authRouter.get("/me", verifyToken, getCurrentUser);
authRouter.post("/logout", verifyToken, logoutUser);

export default authRouter;

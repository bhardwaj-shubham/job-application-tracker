import express from "express";

import {
  getCurrentUser,
  loginUser,
  signupUser,
} from "../controllers/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", verifyToken, getCurrentUser);

export default authRouter;

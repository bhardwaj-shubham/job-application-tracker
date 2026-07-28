import express from "express";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signupUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", verifyToken, getCurrentUser);
authRouter.post("/logout", verifyToken, logoutUser);

export default authRouter;

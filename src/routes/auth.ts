import { Router } from "express";
const router: Router = require("express").Router();
import {
  LoginController,
  RegisterController,
  RefreshTokens,
  LogoutController,
} from "../controllers/auth";
import { registerValidate, loginValidate } from "../middlewares/auth/index";

router.post("/register", registerValidate, RegisterController);
router.post("/login", loginValidate, LoginController);
router.post("/refresh-tokens", RefreshTokens);
router.post("/logout", LogoutController);

export default router;

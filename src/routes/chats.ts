import { Router } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import ChatController from "../controllers/chat";

const router: Router = require("express").Router();
router.get("/", verifyAuth, ChatController.index);

export default router;

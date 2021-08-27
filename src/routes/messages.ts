import { Router } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import MessageController from "../controllers/message";
const router: Router = require("express").Router();

router.get("/:recipient", verifyAuth, MessageController.index);
router.post("/:recipient", verifyAuth, MessageController.store);
router.get("/search/:user", verifyAuth, MessageController.getUsers);
router.get("/read-new/:recipient", verifyAuth, MessageController.newMessage);

export default router;

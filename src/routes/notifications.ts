import { Router } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import NotificationsController from "../controllers/notification";
const router: Router = require("express").Router();

router.get("/", verifyAuth, NotificationsController.index);
router.get("/check-new", verifyAuth, NotificationsController.checkNew);
router.get(
  "/get-new",
  verifyAuth,
  NotificationsController.getNewNotifications
);
router.patch("/read-all", verifyAuth, NotificationsController.markAllAsRead);
router.patch("/read-single", verifyAuth, NotificationsController.markOneAsRead);

export default router;

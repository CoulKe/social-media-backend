import { Router } from "express";
import CommentController from "../controllers/comment";
import verifyAuth from "../middlewares/auth/verifyAuth";
const router: Router = require("express").Router();

router.get("/", CommentController.index);
router.get("/single", CommentController.single);
router.post("/", verifyAuth, CommentController.store);
router.patch("/", verifyAuth, CommentController.update);
router.delete("/", verifyAuth, CommentController.destroy);
export default router;

import { Router } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import PostController from "../controllers/post";

const router: Router = require("express").Router();

router.get("/", PostController.index);
router.get("/single", PostController.single);
router.post("/", verifyAuth, PostController.store);
router.patch("/edit", verifyAuth, PostController.update);
router.patch("/pin", verifyAuth, PostController.togglePinPost);
router.delete("/delete", verifyAuth, PostController.destroy);

export default router;

import { Router } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import PostLikeController from "../controllers/post-like";

const router: Router = require("express").Router();

router.post("/", verifyAuth, PostLikeController.store);

export default router;

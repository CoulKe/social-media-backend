import { Router } from "express";
import HashtagController from "../controllers/hashtag";

const router: Router = require("express").Router();

router.get("/", HashtagController.index);

export default router;

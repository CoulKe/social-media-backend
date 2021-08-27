import { Router, Request, Response } from "express";
import verifyAuth from "../middlewares/auth/verifyAuth";
import ProfileController from "../controllers/profile";

const router: Router = require("express").Router();

router.get("/", verifyAuth, ProfileController.index);
router.patch("/bio", verifyAuth, ProfileController.updateBio);
router.patch("/details", verifyAuth, ProfileController.updateDetails);

export default router;

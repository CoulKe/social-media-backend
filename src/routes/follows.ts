import { Router } from "express";
import FollowController from "../controllers/follow";
import verifyAuth from "../middlewares/auth/verifyAuth";

const followRouter: Router = require("express").Router();
const followersRouter: Router = require("express").Router();
const followingsRouter: Router = require("express").Router();

followRouter.post("/", verifyAuth, FollowController.storeOrDestroy);

followersRouter.get("/", FollowController.getFollowers);
followingsRouter.get("/", FollowController.getFollowings);

export { followRouter, followersRouter, followingsRouter };

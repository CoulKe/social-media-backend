import { Router } from "express";
import SearchController from "../controllers/search";

const router: Router = require("express").Router();

router.get("/", SearchController.index);

export default router;

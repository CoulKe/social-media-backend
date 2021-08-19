import CommentLikeController from "../controllers/comment-like";
import verifyAuth from "../middlewares/auth/verifyAuth";

const router = require("express").Router();

router.post("/", verifyAuth, CommentLikeController.storeOrDestroy);

export default router;

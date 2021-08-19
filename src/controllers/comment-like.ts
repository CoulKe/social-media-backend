import Cookies from "cookies";
import { Request, Response } from "express";
import UserModel from "../models/user.model";
import CommentLikeModel from "../models/comment-like.model";
import CommentModel from "../models/comment.model";
import PostModel from "../models/post.model";
import NotificationController from "./notification";
import { createTextSnippet } from "../utils/format";

class CommentLikeController {
  async storeOrDestroy(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const username = cookie.get("username");
    const id = cookie.get("id");
    let { postId, commentId } = req.body;

    try {
      let existingPost = await PostModel.exists({ _id: postId });

      let existingUser = await UserModel.findOne(
        { username },
        {
          email: 0,
          password: 0,
          __v: 0,
          _id: 0,
          date_created: 0,
          bio: 0,
          residence: 0,
          school: 0,
        }
      );

      if (!existingUser)
        return res.status(401).json({ msg: "Use a registered account" });

      if (!existingPost)
        return res.status(422).json({ msg: "Post no longer exists" });

      let existingLike = await CommentLikeModel.exists({
        comment_id: commentId,
      });
      let shouldNotify = false;

      if (!existingLike) {
        await CommentLikeModel.create({
          username,
          comment_id: commentId,
        });
        shouldNotify = true;
      } else {
        await CommentLikeModel.deleteOne({ comment_id: commentId });
      }

      let commentLikes = await CommentLikeModel.find({
        comment_id: commentId,
      }).countDocuments();
      let comment = await CommentModel.findOneAndUpdate(
        { _id: commentId },
        { $set: { likes: commentLikes } },
        {
          projection: {
            __v: 0,
            date_created: 0,
            date_updated: 0,
          },
          new: true,
        }
      );
      let hasLiked = await CommentLikeModel.exists({
        comment_id: commentId,
        username,
      });

      let commentOwner = await UserModel.findOne({
        username: comment.username,
      });

      // Check authenticated user isn't the comment owner.
      if (shouldNotify && commentOwner._id.toString() !== id) {
        let commentSnippet = createTextSnippet(comment.comment);
        await NotificationController.store(
          commentOwner._id,
          "comment-like",
          `${commentOwner.first_name} ${commentOwner.last_name} liked your comment: "${commentSnippet}"`,
          comment.post_id,
          comment._id
        );
      }

      let result = {
        ...comment._doc,
        first_name: commentOwner.first_name,
        last_name: commentOwner.last_name,
        hasLiked,
      };

      return res.json(result);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
}

export default new CommentLikeController();

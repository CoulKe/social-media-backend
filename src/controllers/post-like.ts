import { Request, Response } from "express";
import { createTextSnippet } from "../utils/format";
const ObjectId = require("mongoose").Types.ObjectId;
import PostModel from "../models/post.model";
import UserModel from "../models/user.model";
import PostLikeModel from "../models/post-like.model";
import NotificationController from "./notification";

class PostLikeController {
  /**Creates like of a post by a user if it doesn't exist and deletes if exists. */
  async store(req: Request, res: Response) {
    const {x_auth_username: username="", x_auth_id: userId=""} = req.headers;
    let { postId } = req.body;

    /**Confirm post hasn't been deleted. */
    let existingPost = await PostModel.exists({ _id: ObjectId(postId) });

    if (!existingPost) {
      return res.status(422).json({ msg: "Post may have been deleted" });
    }

    /**Confirm if authenticated user has already liked the post. */
    let existingLike = await PostLikeModel.exists({
      post_id: ObjectId(postId),
      username,
    });
    let updatedPost: any = {};

    let hasLiked = false;

    try {
      if (!existingLike) {
        await PostLikeModel.create({
          post_id: ObjectId(postId),
          username,
        });
        let likesCount = await PostLikeModel.find({
          post_id: ObjectId(postId),
        }).countDocuments();

        updatedPost = await PostModel.findOneAndUpdate(
          { _id: ObjectId(postId) },
          { likes: likesCount },
          {
            projection: {
              __v: 0,
              date_updated: 0,
            },
            new: true,
          }
        );

        hasLiked = true;

        // Only update when it's not the person who created the post likes

        if (updatedPost.user_id.toString() !== userId.toString()) {
          let postSnippet = createTextSnippet(updatedPost.post, 20);
          let user = await UserModel.findOne({ username });

          await NotificationController.store(
            userId.toString(),
            "like",
            `<b>${user.first_name} ${user.last_name}</b> liked your <b>post</b>: "${postSnippet}"`,
            postId
          );
        }
        delete updatedPost.user_id;
      } else {
        await PostLikeModel.deleteOne({
          post_id: ObjectId(postId),
          username,
        });
        let likesCount = await PostLikeModel.find({
          post_id: ObjectId(postId),
        }).countDocuments();

        updatedPost = await PostModel.findOneAndUpdate(
          { _id: ObjectId(postId) },
          { likes: likesCount },
          {
            projection: {
              user_id: 0,
              __v: 0,
            },
            new: true,
          }
        );

        hasLiked = false;
      }
    } catch (e) {
      res.status(403).json({ msg: "error" });
    }

    let result = { ...updatedPost._doc, hasLiked };

    res.status(200).json(result);
  }
}

export default new PostLikeController();

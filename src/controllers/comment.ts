import { Request, Response } from "express";
import Cookies from "cookies";
import CommentModel from "../models/comment.model";
import PostModel from "../models/post.model";
import UserModel from "../models/user.model";
import PostLikeModel from "../models/post-like.model";
import CommentLikeModel from "../models/comment-like.model";
import NotificationController from "./notification";
import { createTextSnippet } from "../utils/format";

const ObjectId = require("mongoose").Types.ObjectId;

class CommentController {
  async index(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    // let  = req.query.postId;
    let { postId, lastCommentId, highlightId } = req.query;
    const username = cookie.get("username");

    let filterQuery = {};

    // Check if there's highlight_id and not fetch it first, it will be fetched later.
    if (lastCommentId && highlightId) {
      filterQuery = {
        post_id: ObjectId(postId),
        _id: {
          $lt: ObjectId(lastCommentId),
          $ne: ObjectId(highlightId),
        },
      };
    } else if (lastCommentId && !highlightId) {
      filterQuery = {
        post_id: ObjectId(postId),
        _id: {
          $lt: ObjectId(lastCommentId),
        },
      };
    } else if (!lastCommentId && highlightId) {
      filterQuery = {
        post_id: ObjectId(postId),
        _id: {
          $ne: ObjectId(highlightId),
        },
      };
    } else {
      filterQuery = {
        post_id: ObjectId(postId),
      };
    }

    try {
      let comments = await CommentModel.find(filterQuery, {
        __v: 0,
        post_id: 0,
      })
        .sort({ _id: -1 })
        .limit(2);

      // fetch the comment to be highlighted comment and push it to the rest.
      // highlighted comment is fetched only when there's no lastCommentId since lastCommentId
      // is only fetched after first load.

      if (!lastCommentId && highlightId) {
        let highlightedComment = await CommentModel.findOne(
          {
            _id: ObjectId(highlightId),
          },
          {
            __v: 0,
            post_id: 0,
          }
        );
        comments.push(highlightedComment);
      }

      for (let i = 0; i < comments.length; i++) {
        let commenter = await UserModel.findOne(
          { username: comments[i].username },
          {
            password: 0,
            __v: 0,
            _id: 0,
            email: 0,
            residence: 0,
            school: 0,
            bio: 0,
          }
        );
        let hasLikedComment = await CommentLikeModel.exists({
          comment_id: comments[i]._id,
          username: commenter.username,
        });
        comments[i] = {
          ...comments[i]._doc,
          ...commenter._doc,
          hasLiked: hasLikedComment,
        };
      }
      let commentsCount = await CommentModel.find({
        post_id: ObjectId(postId),
      }).countDocuments();
      let post = await PostModel.findOne({ _id: ObjectId(postId) }, { __v: 0 });
      let likes = await PostLikeModel.find({
        post_id: postId,
      }).countDocuments();
      let hasLikedPost = await PostLikeModel.exists({
        post_id: postId,
        username,
      });

      post = {
        ...post._doc,
        hasLiked: hasLikedPost,
        likes,
        comments: commentsCount,
      };

      res.json({ comments, post });
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  async single(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const authenticatedUser = cookie.get("username");
    const { commentId, postId } = req.query;

    try {
      const comment = await CommentModel.findOne(
        { _id: commentId, post_id: postId },
        { post_id: 0, __v: 0 }
      );

      let hasLiked = await CommentLikeModel.exists({
        comment_id: comment._id,
        username: authenticatedUser,
      });

      res.status(200).json({ ...comment._doc, hasLiked });
    } catch (err) {
      res.status(500).json("server error");
    }
  }

  async store(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const username = cookie.get("username") || "";
    const id = cookie.get("id") || "";
    const { postId, comment } = req.body;

    if (!comment.trim().length) {
      return res.status(422).json({ msg: "Empty comments not allowed" });
    }
    if (!postId) {
      return res.status(422).json({ msg: "Post id not sent" });
    }
    if (!username) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    try {
      let commenter = await UserModel.findOne(
        { username },
        {
          _id: 0,
          email: 0,
          password: 0,
          __v: 0,
          date_created: 0,
          bio: 0,
          residence: 0,
          school: 0,
        }
      );
      let newComment = await CommentModel.create({
        post_id: ObjectId(postId),
        username,
        comment,
        likes: 0,
      });
      let postCommentsCount = await CommentModel.find({
        post_id: ObjectId(postId),
      }).countDocuments();
      commenter = commenter._doc;
      newComment = newComment._doc;
      delete newComment.__v;

      // let commentedPost = await PostModel.findOne({ _id: ObjectId(postId) });
      let commentedPost = await PostModel.findOneAndUpdate(
        { _id: ObjectId(postId) },
        { $set: { comments: postCommentsCount } },
        {
          new: true,
        }
      );

      // If it's not the post owner who commented, notify him/her.
      if (commentedPost.user_id.toString() !== id) {
        let commentSnippet = createTextSnippet(newComment.comment, 20);

        await NotificationController.store(
          commentedPost.user_id,
          "comment",
          `<b>${commenter.first_name} ${commenter.last_name}</b> commented on your <b>post</b>:"${commentSnippet}"`,
          commentedPost._id,
          newComment._id
        );
      }
      res.json({ ...newComment, ...commenter });
    } catch (error) {
      res.status(500).json("server error");
    }
  }
  async update(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const username = cookie.get("username");
    const { commentId, comment } = req.body;

    try {
      const commentExists = await CommentModel.exists({
        _id: commentId,
        username,
      });
      if (!commentExists)
        return res
          .status(422)
          .json({ msg: "Comment doesn't exist or you don't have permission" });
      if (!comment.length)
        return res.status(422).json({ msg: "You can't post blank comment" });

      let editedComment = await CommentModel.findOneAndUpdate(
        { _id: commentId },
        {
          $set: {
            comment,
            date_updated: new Date().getTime(),
          },
        },
        {
          projection: {
            __v: 0,
          },
          new: true,
        }
      );
      const commenter = await UserModel.findOne(
        { username },
        {
          _id: 0,
          email: 0,
          password: 0,
          __v: 0,
          date_created: 0,
          bio: 0,
          residence: 0,
          school: 0,
        }
      );

      const result = { ...commenter._doc, ...editedComment._doc };
      return res.json(result);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  async destroy(req: Request, res: Response) {
    const { commentId } = req.body;

    try {
      await CommentModel.deleteOne({ _id: commentId });
      res.status(200).json({ msg: "Deleted" });
    } catch (err) {
      res.status(500).json("server error");
    }
  }
}

export default new CommentController();

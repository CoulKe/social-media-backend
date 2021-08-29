/**Controller for crud operations involving posts. */

import { Request, Response } from "express";
const ObjectId = require("mongoose").Types.ObjectId;
import UserModel from "../models/user.model";
import PostModel from "../models/post.model";
import PostLikeModel from "../models/post-like.model";
import CommentModel from "../models/comment.model";

class PostController {
  /**
   * Gets all posts with a set limit.
   */
  async index(req: Request, res: Response) {
    const {x_auth_username: authenticatedUser, x_auth_id: id,x_refresh: refreshToken} = req.headers;

    try {
      //If the user is not logged in.
      // Just a temporary fix to be fixed later.
      if(req.query.lastId && !refreshToken){
        return res.json({posts:[]});
      }
      if(!refreshToken){
        let posts = await PostModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
             $match: {
               "user.username": 'admin'
             } 
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              "user.password": 0,
              "user.email": 0,
              "user.date_created": 0,
              "user._id": 0,
              "user.bio": 0,
              "user.residence": 0,
              "user.school": 0,
              "user_id": 0,
              "user.__v": 0,
              "__v": 0,
            },
          },
        ]);

        let result: any = [];

        for (let i = 0; i < posts.length; i++) {
         // Total post likes
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          // Total post comments
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();

          result.push({ ...posts[i], likes: totalLikes, comments, hasLiked: false });
        }
       return  res.status(200).json({ posts: result });
      }

      //First load don't check for lastId as it's for loading more.
      if (!req.query.lastId && refreshToken) {
        // Get all posts and join with users model
        let posts = await PostModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $unwind: "$user",
          },
          {
            $lookup: {
              from: "follows",
              localField: "user_id",
              foreignField: "followed_id",
              as: "follows",
            }
          },
          {
            $unwind: "$follows"
          },
          {
            $match: {
              "follows.follower_id": ObjectId(id)
            },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              "follows":0,
              "user.password": 0,
              "user.email": 0,
              "user.date_created": 0,
              "user._id": 0,
              "user.bio": 0,
              "user.residence": 0,
              "user.school": 0,
              "user_id": 0,
              "user.__v": 0,
              "__v": 0,
            },
          },
        ]);

        let result: any = [];

        for (let i = 0; i < posts.length; i++) {
          // Confirm if the user has liked the post
          let hasLiked = await PostLikeModel.exists({
            post_id: posts[i]._id,
            username: authenticatedUser,
          });
          // Total post likes
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          // Total post comments
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();

          result.push({ ...posts[i], likes: totalLikes, comments, hasLiked });
        }
        res.status(200).json({ posts: result });
      } else if(req.query.lastId && refreshToken){
        let posts = await PostModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $unwind: "$user",
          },
          {
            $lookup: {
              from: "follows",
              localField: "user_id",
              foreignField: "followed_id",
              as: "follows",
            }
          },{
            $unwind: "$follows"
          },
          {
            $match: {
              _id: { $lt: ObjectId(req.query.lastId) },
              "follows.follower_id": ObjectId(id),
            },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              "follows":0,
              "user.password": 0,
              "user.email": 0,
              "user.date_created": 0,
              "user._id": 0,
              "user.bio": 0,
              "user.residence": 0,
              "user.school": 0,
              "user_id": 0,
              "user.__v": 0,
              "__v": 0,
            },
          },
        ]);

        let result: any = [];

        for (let i = 0; i < posts.length; i++) {
          let hasLiked = await PostLikeModel.exists({
            post_id: posts[i]._id,
            username: authenticatedUser,
          });
          // Total post likes
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          // Total post comments
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();

          result.push({ ...posts[i], likes: totalLikes, comments, hasLiked });
        }

        res.status(200).json({ posts: result });
      }
    } catch (e) {
      res.status(500).json("server error");
    }
  }
  /**
   * Gets a single post.
   * @returns response
   */
  async single(req: Request, res: Response) {
    const { postId } = req.query;
    const {x_auth_username: authenticatedUser} = req.headers;

    try {
      let post = await PostModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $match: {
            _id: ObjectId(postId),
          },
        },
        {
          $limit: 1,
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            "user.password": 0,
            "user.email": 0,
            "user.date_created": 0,
            "user._id": 0,
            "user.bio": 0,
            "user.residence": 0,
            "user.school": 0,
            user_id: 0,
            "user.__v": 0,
            __v: 0,
          },
        },
      ]);

      let result = [];

      if (post.length) {
        let userLikes = await PostLikeModel.find({
          post_id: post[0]._id,
          username: authenticatedUser,
        }).countDocuments();
        let totalLikes = await PostLikeModel.find({
          post_id: post[0]._id,
        }).countDocuments();
        let comments = await CommentModel.find({
          post_id: post[0]._id,
        }).countDocuments();
        let hasLiked = userLikes > 0 ? true : false;

        result.push({ ...post[0], likes: totalLikes, comments, hasLiked });
      }
      return res.status(200).json(result[0]);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  /**
   * Saves post to the post collection.
   * @returns res
   */
  async store(req: Request, res: Response) {
    const {x_auth_id: id} = req.headers;
    const { post } = req.body;

    if (!post.length)
      return res.status(422).json({ msg: "Post can't be empty" });
    if (post.length > 500)
      return res
        .status(422)
        .json({ msg: "Post can't be more than 500 characters" });

    if (id) {
      try {
        let createdPost = await PostModel.create({
          user_id: id,
          post,
          likes: 0,
          comments: 0,
        });

        createdPost = createdPost._doc;
        delete createdPost.__v;
        delete createdPost.user_id;

        let user = await UserModel.findOne(
          { _id: id },
          {
            password: 0,
            __v: 0,
            email: 0,
            _id: 0,
            date_created: 0,
            bio: 0,
            residence: 0,
            school: 0,
          }
        );
        let result = { user, ...createdPost };
        return res.status(200).json(result);
      } catch (e) {
        res.status(500).json("server error");
      }
    }
    return res.status(403).json({ msg: "forbidden" });
  }
  /**
   * Updates a single post.
   */
  async update(req: Request, res: Response) {
    const { postId, post } = req.body;
    try {
      const updatedPost = await PostModel.findOneAndUpdate(
        { _id: postId },
        { $set: { post, date_updated: new Date().getTime() } },
        {
          projection: {
            __v: 0,
          },
          new: true,
        }
      );
      const commentsCount = await CommentModel.find({
        post_id: postId,
      }).countDocuments();
      const likesCount = await PostLikeModel.find({
        post_id: postId,
      }).countDocuments();

      return res.status(200).json({
        ...updatedPost._doc,
        comments: commentsCount,
        likes: likesCount,
      });
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  /**
   * Pins/Unpins a single post of individual user to be highlighted as the first post on the user profile.
   */
  async togglePinPost(req: Request, res: Response) {
    try {
      const {x_auth_id: id} = req.headers;
      const { postId } = req.body;
      const oldPinnedPost = await PostModel.findOne({
        user_id: ObjectId(id),
        isPinned: true,
      });
      let result;
      let post;

      // Check if it's not already pinned and update.
      if (postId.toString() !== oldPinnedPost?._id?.toString()) {
        // Unpin the old post
        if (oldPinnedPost?._id) {
          await PostModel.updateOne(
            { _id: ObjectId(oldPinnedPost.id) },
            { $set: { isPinned: false } },
            {
              projection: {
                __v: 0,
              },
              new: true,
            }
          );
        }

        // pin new post.
        post = await PostModel.findOneAndUpdate(
          { _id: ObjectId(postId), user_id: ObjectId(id) },
          { $set: { isPinned: true } },
          {
            projection: {
              __v: 0,
            },
            new: true,
          }
        );
      }
      // Unpin
      else {
        post = await PostModel.findOneAndUpdate(
          { _id: ObjectId(postId) },
          { $set: { isPinned: false } },
          {
            projection: {
              __v: 0,
            },
            new: true,
          }
        );
      }

      let { first_name, last_name, username } = await UserModel.findOne({
        _id: ObjectId(post.user_id),
      });

      result = { ...post._doc, user: { first_name, last_name, username } };

      res.json(result);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  /**
   * Deletes a single post.
   * @returns response
   */
  async destroy(req: Request, res: Response) {
    const { postId } = req.body;

    try {
      let r = await PostModel.deleteOne({ _id: postId });
      return res.status(200).json({ msg: "Post deleted" });
    } catch (err) {
      res.status(500).json("server error");
    }
  }
}
export default new PostController();

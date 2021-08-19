/**Controller for user details. */
import { Request, Response } from "express";
import Cookies from "cookies";
import UserModel from "../models/user.model";
import PostModel from "../models/post.model";
import PostLikeModel from "../models/post-like.model";
import FollowModel from "../models/follows.model";
import CommentModel from "../models/comment.model";

const ObjectId = require("mongoose").Types.ObjectId;

class Profile {
  async index(req: Request, res: Response) {
    const { username } = req.query;
    const cookie = new Cookies(req, res);
    let authenticatedUser = cookie.get("username");
    let authId = cookie.get("id");
    let isFollowing;
    let userInfo = await UserModel.findOne(
      { username },
      { password: 0, __v: 0, email: 0 }
    );

    if (!userInfo) return res.status(422).json({ msg: "User not found" });

    if (username !== authenticatedUser) {
      isFollowing = await FollowModel.exists({
        follower_id: authId,
        followed_id: userInfo._id,
      });
    }
    let followersCount = await FollowModel.find({
      followed_id: ObjectId(userInfo._id),
    }).countDocuments();
    let followingsCount = await FollowModel.find({
      follower_id: ObjectId(userInfo._id),
    }).countDocuments();

    userInfo = { ...userInfo._doc, followingsCount, followersCount };

    try {
      //First load
      if (!req.query.lastId) {
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
            $match: {
              user_id: ObjectId(userInfo._id),
              isPinned: false,
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 10,
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
              user_id: 0,
              "user.__v": 0,
              bio: 0,
              school: 0,
              residence: 0,
              __v: 0,
            },
          },
        ]);

        let result: any = [];

        for (let i = 0; i < posts.length; i++) {
          let hasLiked = await PostLikeModel.exists({
            post_id: posts[i]._id,
            username: authenticatedUser,
          });
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();

          result.push({ ...posts[i], likes: totalLikes, comments, hasLiked });
        }
        // Add pinned post
        const pinnedPost = await PostModel.findOne(
          { user_id: ObjectId(userInfo._id), isPinned: true },
          { __v: 0 }
        );

        if (pinnedPost) {
          const {
            first_name,
            last_name,
            username: user,
          } = await UserModel.findOne({ _id: ObjectId(userInfo._id) });
          let hasLiked = await PostLikeModel.exists({
            post_id: pinnedPost._id,
            username: authenticatedUser,
          });
          let totalLikes = await PostLikeModel.find({
            post_id: pinnedPost._id,
          }).countDocuments();
          let comments = await CommentModel.find({
            post_id: pinnedPost._id,
          }).countDocuments();

          result.push({
            ...pinnedPost._doc,
            likes: totalLikes,
            comments,
            hasLiked,
            user: { first_name, last_name, username },
          });
        }

        switch (isFollowing) {
          case undefined:
            return res.status(200).json({ posts: result, userInfo });
          default:
            return res
              .status(200)
              .json({ posts: result, userInfo, isFollowing });
        }
      } else {
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
            $match: {
              _id: { $lt: ObjectId(req.query.lastId) },
              user_id: ObjectId(userInfo._id),
              isPinned: false,
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 10,
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
              user_id: 0,
              "user.__v": 0,
              bio: 0,
              school: 0,
              residence: 0,
              __v: 0,
            },
          },
        ]);

        // Join the output of the fetched posts and
        // the number of likes and comments they contain individually.

        let result: any = [];

        for (let i = 0; i < posts.length; i++) {
          let userLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
            username: authenticatedUser,
          }).countDocuments();
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          let hasLiked = userLikes > 0 ? true : false;

          result.push({ ...posts[i], likes: totalLikes, comments, hasLiked });
        }

        switch (isFollowing) {
          case undefined:
            return res.status(200).json({ posts: result, userInfo });
          default:
            return res
              .status(200)
              .json({ posts: result, userInfo, isFollowing });
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).json("server error");
    }
  }
  async updateBio(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const id = cookie.get("id");
    const { bio } = req.body;

    let userInfo = await UserModel.findOneAndUpdate(
      { _id: id },
      { bio },
      {
        projection: {
          password: 0,
          email: 0,
          __v: 0,
        },
        new: true,
      }
    );

    return res.json(userInfo);
  }
  async updateDetails(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const id = cookie.get("id");
    const { residence, school } = req.body;

    let userInfo = await UserModel.findOneAndUpdate(
      { _id: id },
      { residence, school },
      {
        projection: {
          password: 0,
          email: 0,
          __v: 0,
        },
        new: true,
      }
    );

    return res.json(userInfo);
  }
}

export default new Profile();

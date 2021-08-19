import { Request, Response } from "express";
import UserModel from "../models/user.model";
import PostModel from "../models/post.model";
import PostLikeModel from "../models/post-like.model";
import CommentModel from "../models/comment.model";
import Cookies from "cookies";

const regexEscape = require("regex-escape");
const ObjectId = require("mongoose").Types.ObjectId;

class Hashtag {
  async index(req: Request, res: Response) {
    let { hashtag, lastId } = req.query;
    const cookie = new Cookies(req, res);
    let authenticatedUser = cookie.get("username");

    let result = [];

    if (hashtag) {
      hashtag = `#${hashtag.toString()}`;
      let escapedHashtag = regexEscape(hashtag);
      let regex = new RegExp(escapedHashtag, "gi");

      try {
        let posts;

        if (lastId) {
          posts = await PostModel.find(
            {
              post: regex,
              _id: {
                $lt: ObjectId(lastId),
              },
            },
            { __v: 0 }
          )
            .sort({ _id: -1 })
            .limit(2);
        } else {
          posts = await PostModel.find({ post: regex }, { __v: 0 })
            .sort({ _id: -1 })
            .limit(2);
        }

        for (let i = 0; i < posts.length; i++) {
          let userLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
            username: authenticatedUser,
          }).countDocuments();
          let user = await UserModel.findOne(
            { username: authenticatedUser },
            {
              __v: 0,
              password: 0,
              bio: 0,
              school: 0,
              residence: 0,
              email: 0,
              _id: 0,
            }
          );
          let totalLikes = await PostLikeModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          let comments = await CommentModel.find({
            post_id: posts[i]._id,
          }).countDocuments();
          let hasLiked = userLikes > 0 ? true : false;

          result.push({
            ...posts[i]._doc,
            likes: totalLikes,
            user,
            comments,
            hasLiked,
          });
        }
      } catch (err) {
        res.status(500).json("server error");
      }
    }

    res.json(result);
  }
}

export default new Hashtag();

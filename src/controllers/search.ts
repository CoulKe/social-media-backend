import { Request, Response } from "express";
import stopWords from "stopword";
import UserModel from "../models/user.model";
import CommentModel from "../models/comment.model";
import PostModel from "../models/post.model";
import PostLikeModel from "../models/post-like.model";
let regexEscape = require("regex-escape");
const ObjectId = require("mongoose").Types.ObjectId;

class Search {
  async index(req: Request, res: Response) {
    const { value: fullText, searchFilter } = req.query;
    const {x_auth_username: authenticatedUser} = req.headers;

    let dataToSearch = [];
    let dataToRegex;
    let result: any = {};
    let users: any = [];
    let posts: any = [];
    let postsData = [];

    let escaped = regexEscape(fullText);
    if (!fullText) {
      return res.json({ users, posts });
    }

    // Remove common english and swahili words.
    dataToSearch = stopWords.removeStopwords(escaped.toString().split(" "), [
      ...stopWords.en,
      ...stopWords.sw,
    ]);
    // Search full text if without common words no text is left. 
    if(!dataToSearch?.length){
      dataToSearch = escaped.toString().split(" ");
    }

      let string = dataToSearch.toString().replace(/,/g, "|");
      dataToRegex = new RegExp(string, "gi");

      switch (searchFilter) {
        case "users":
          users = await UserModel.find(
            {
              $or: [
                { username: dataToRegex },
                { first_name: dataToRegex },
                { last_name: dataToRegex },
              ],
            },
            {
              password: 0,
              __v: 0,
              email: 0,
              bio: 0,
              residence: 0,
              date_created: 0,
            }
          ).limit(20);
          break;
        case "posts":
          posts = await PostModel.find({ post: dataToRegex })
            .sort({ _id: -1 })
            .limit(20);
          break;

        default:
          users = await UserModel.find(
            {
              $or: [
                { username: dataToRegex },
                { first_name: dataToRegex },
                { last_name: dataToRegex },
              ],
            },
            {
              password: 0,
              __v: 0,
              email: 0,
              bio: 0,
              residence: 0,
              date_created: 0,
            }
          ).limit(5);

          posts = await PostModel.find({ post: dataToRegex })
            .sort({ _id: -1 })
            .limit(20);
          break;
      }

    for (let i = 0; i < posts.length; i++) {
      let userLikes = await PostLikeModel.find({
        post_id: posts[i]._id,
        username: authenticatedUser,
      }).countDocuments();
      let user = await UserModel.findOne(
        { _id: ObjectId(posts[i].user_id) },
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

      postsData.push({
        ...posts[i]._doc,
        likes: totalLikes,
        user,
        comments,
        hasLiked,
      });
    }

    result.users = users;
    result.posts = postsData;

    res.json(result);
  }
}

export default new Search();

import { Response, Request } from "express";
const ObjectId = require("mongoose").Types.ObjectId;
import NotificationController from "./notification";
import FollowModel from "../models/follows.model";
import UserModel from "../models/user.model";

class FollowController {
  async getFollowers(req: Request, res: Response) {
    let username = req.query.username;
    if (!username) return res.status(422);
    let user = await UserModel.findOne({ username });

    if (!user) return res.status(422).json({ msg: "invalid request" });

    let userId = user._id;

    let followers = await FollowModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "follower_id",
          foreignField: "_id",
          as: "follower",
        },
      },
      {
        $match: { followed_id: ObjectId(userId) },
      },
      {
        $unwind: "$follower",
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          date_created: 0,
          followed_id: 0,
          follower_id: 0,
          "follower.password": 0,
          "follower.email": 0,
          "follower.date_created": 0,
          "follower.__v": 0,
        },
      },
    ]);

    return res.status(200).json(followers);
  }
  async getFollowings(req: Request, res: Response) {
    let username = req.query.username;
    if (!username) return res.status(422);
    let user = await UserModel.findOne({ username });

    if (!user) return res.status(422).json({ msg: "invalid request" });

    let userId = user._id;

    let followings = await FollowModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followed_id",
          foreignField: "_id",
          as: "following",
        },
      },
      {
        $match: { follower_id: ObjectId(userId) },
      },
      {
        $unwind: "$following",
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          date_created: 0,
          followed_id: 0,
          follower_id: 0,
          "following.password": 0,
          "following.email": 0,
          "following.date_created": 0,
          "following.__v": 0,
        },
      },
    ]);

    return res.status(200).json(followings);
  }
  /** Follows or unfollows a user.*/
  async storeOrDestroy(req: Request, res: Response) {
    const { user_id, following_id } = req.body;
    /**Confirm user isn't trying to follow him/herself */
    if (user_id === following_id)
      return res.status(422).json({ msg: "You can't follow yourself" });

    let check = await FollowModel.exists({
      follower_id: user_id,
      followed_id: following_id,
    });

    // If it doesn't exist follow and notify the followed person, else unfollow.
    if (!check) {
      try {
        await FollowModel.create({
          follower_id: user_id,
          followed_id: following_id,
        });
        let followersCount = await FollowModel.find({
          followed_id: following_id,
        }).countDocuments();
        let followingsCount = await FollowModel.find({
          follower_id: following_id,
        }).countDocuments();

        let followedUser = await UserModel.findOne(
          { _id: following_id },
          { __v: 0, password: 0, email: 0 }
        );
        let theFollower = await UserModel.findOne({ _id: user_id });

        await NotificationController.store(
          following_id,
          "follow",
          `<b>${theFollower.first_name} ${theFollower.last_name}</b> followed you.`,
          undefined,
          undefined,
          followedUser.username
        );

        followedUser = {
          ...followedUser._doc,
          followingsCount,
          followersCount,
        };

        return res
          .status(200)
          .json({ isFollowing: true, userInfo: followedUser });
      } catch (err) {
        res.status(500).json("server error");
      }
    } else {
      try {
        await FollowModel.deleteOne({
          follower_id: user_id,
          followed_id: following_id,
        });
        let unFollowedUser = await UserModel.findOne(
          { _id: following_id },
          { __v: 0, password: 0, email: 0 }
        );

        let followersCount = await FollowModel.find({
          followed_id: following_id,
        }).countDocuments();

        let followingsCount = await FollowModel.find({
          follower_id: following_id,
        }).countDocuments();

        unFollowedUser = {
          ...unFollowedUser._doc,
          followingsCount,
          followersCount,
        };

        return res
          .status(200)
          .json({ isFollowing: false, userInfo: unFollowedUser });
      } catch (err) {
        res.status(500).json("server error");
      }
    }
  }
}

export default new FollowController();
export { FollowController as FollowClass };

/**Controller for viewing available chats */

import { Request, Response } from "express";
import ChatModel from "../models/chat.model";
import Cookies from "cookies";

class ChatController {
  /**Method for displaying all the chats overview of the authenticated user. */
  async index(req: Request, res: Response) {
    try {
      const cookie = new Cookies(req, res);
      const username = cookie.get("username") || "";
      let chats = await ChatModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "username",
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

      res.json(chats);
    } catch (e) {
      res.status(500).json("server error");
    }
  }
}

export default new ChatController();

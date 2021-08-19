/**Controller for showing and composing messages */

import Cookies from "cookies";
import { createChatName, createTextSnippet } from "../utils/format";
import { Request, Response } from "express";

import MessageModel from "../models/message.model";
import ChatModel from "../models/chat.model";
import UserModel from "../models/user.model";
let regexEscape = require("regex-escape");
const ObjectId = require("mongoose").Types.ObjectId;

class MessageController {
  /**Displays all the messages in a single chat thread. */
  async index(req: Request, res: Response) {
    const { recipient } = req.params;
    const { authenticatedUser } = req.query;

    let chatName = "";
    if (recipient && authenticatedUser) {
      chatName = createChatName(authenticatedUser.toString(), recipient);
    }

    if (chatName) {
      try {
        let messages = await MessageModel.find(
          { chat_name: chatName.toString() },
          { __v: 0 }
        ).sort({ date_created: 1 });

        // for(let i = 0; i < messages.length; i++){
        //   // Check if message has not been read yet and update
        //   if(!messages[i].received && authenticatedUser !== messages[i].recipient){
        //     await MessageModel.updateOne({_id: messages[i]._id},{$set: {received: true}});
        //     messages[i].received = true;
        //   }
        // }

        const { first_name, last_name, username } = await UserModel.findOne({
          username: recipient,
        });

        return res
          .status(200)
          .json({ messages, user: { first_name, last_name, username } });
      } catch (err) {
        res.status(500).json("server error");
      }
    }
    return res.status(422).json({ msg: "Request can't be processed" });
  }
  /**Displays new messages. */
  async newMessage(req: Request, res: Response) {
    const cookie = new Cookies(req, res);
    const { recipient } = req.params;
    const { lastId } = req.query;
    // const lastId = "";
    const authenticatedUser = cookie.get("username") || "";

    let chatName = "";
    if (recipient && authenticatedUser) {
      chatName = createChatName(authenticatedUser.toString(), recipient);
    }

    if (chatName) {
      try {
        let messages;
        if (lastId) {
          messages = await MessageModel.find({
            _id: { $gt: ObjectId(lastId) },
            chat_name: chatName.toString(),
          }).limit(10);
        } else {
          messages = await MessageModel.find({
            chat_name: chatName.toString(),
          });
        }

        return res.status(200).json(messages);
      } catch (err) {
        res.status(500).json("server error");
      }
    }
    return res.status(422).json({ msg: "Request can't be processed" });
  }

  async getUsers(req: Request, res: Response) {
    try {
      const cookie = new Cookies(req, res);
      const id = cookie.get("id");
      const username = cookie.get("username");
      const { user } = req.params;
      let escaped = regexEscape(user);
      let dataToRegex = new RegExp(escaped, "gi");

      let users = await UserModel.find(
        { username: dataToRegex },
        {
          password: 0,
          _id: 0,
          email: 0,
          residence: 0,
          school: 0,
          bio: 0,
          date_created: 0,
          __v: 0,
        }
      ).limit(10);

      res.json(users);
    } catch (err) {
      res.status(500).json("server error");
    }
  }

  /**Create a new message. */
  async store(req: Request, res: Response) {
    const { recipient } = req.params;
    const { message, sender } = req.body;
    if (recipient === sender) {
      return res.status(422).json({ msg: "You cannot message yourself" });
    }

    let chatName = createChatName(recipient, sender);

    let chatSnippet = createTextSnippet(message);
    try {
      let savedMessage = await MessageModel.create({
        message: message,
        sender,
        recipient,
        chat_name: chatName.toString(),
        date_created: new Date().getTime(),
      });

      // Updates if chat name exists and creates if it doesn't exist.
      // Note: Chat name needs to display a snippet of the last chat and date.

      let updatedChatName = await ChatModel.findOneAndUpdate(
        {
          chat_name: chatName.toString(),
        },
        {
          sender,
          recipient,
          chat_snippet: chatSnippet.toString(),
          date_updated: new Date().getTime(),
        },
        {
          upsert: true,
          projection: {
            __v: 0,
          },
          new: true,
        }
      );

      res.json({ chat: updatedChatName, message: savedMessage });
    } catch (err) {
      res.status(500).json("server error");
    }
  }
}

export default new MessageController();

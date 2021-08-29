/**Controller for viewing available chats */

import { Request, Response } from "express";
import ChatModel from "../models/chat.model";
import UserModel from "../models/user.model";

class ChatController {
  /**Method for displaying all the chats overview of the authenticated user. */
  async index(req: Request, res: Response) {
    try {
      const {x_auth_username: username} = req.headers;
      let result: any = [];
      let chats = await ChatModel.find({$or: [{sender: username},{recipient: username?.toString()}]},{__v: 0});
      
      for(let chat of chats){
        let userToGet = '';
        if(chat.sender === username?.toString()){
          userToGet = chat.recipient;
        }
        else{
          userToGet = chat.sender;
        }
        await ChatModel.updateOne({_id: chat._id}, {$set: {notified: true}});
        let user = await UserModel.findOne({username: userToGet});
        result.push({...chat._doc, notified: true,user: {first_name: user.first_name, last_name: user.last_name, username}})
      }

      for(let i=0; i < result.length; i++){
        if(!result[i]?.notified){
          await ChatModel.updateOne({_id: result[i]._id},{$set: {notified: true}});
          result[i].notified = true;
        }
      }
      res.json(result);
    } catch (e) {
      res.status(500).json("server error");
    }
  }
  async checkNew(req: Request, res: Response){
    try {
      const {x_auth_username: username} = req.headers;
      let hasNew = await ChatModel.exists({notified: false, recipient: username});
      res.json({hasNew});

    } catch (error) {
      res.status(500).json("server error");
    }
  }
}

export default new ChatController();

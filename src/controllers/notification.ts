import { Response, Request } from "express";
import NotificationModel from "../models/notification.model";
const ObjectId = require("mongoose").Types.ObjectId;

class NotificationController {
  async index(req: Request, res: Response) {
    const {x_auth_id: id} = req.headers;
    try {
      let notifications = await NotificationModel.find({user_id: ObjectId(id)},{__v: 0, user_id: 0});
      for(let notification of notifications){
        notification.notified = true;
        await NotificationModel.updateOne({_id: notification},{$set: {notified: true}});
      }
      
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).json("server error");
    }
  }

  async getNewNotifications(req: Request, res: Response) {
    const {x_auth_id: id} = req.headers;
    let { lastId } = req.query;

    try {
      let notifications;
      if (lastId) {
        notifications = await NotificationModel.find({
          _id: { $gt: ObjectId(lastId) },
        });
      } else {
        notifications = await NotificationModel.find({});
      }
      // let notifications = await NotificationModel.find({_id: {$gt: ObjectId(lastId)}, user_id: ObjectId(id)});
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  async checkNew(req: Request, res: Response) {
    const {x_auth_id: id} = req.headers;

    try {
      let hasNew = await NotificationModel.exists({user_id: ObjectId(id), notified: false});
      res.status(200).json({hasNew});
    } catch (err) {
      res.status(500).json("server error");
    }
  }
  /**
   * Creates a new notification.
   * Follows don't need a link_id/highlight_id but a username.
   * @param user_id - Id of the user to be notified.
   * @param type - Type of the notification.
   * @param description - Description of the notification.
   * @param link_id - Id of the post, comment or follower (optional).
   * @param highlight_id - comment to be highlighted (optional).
   * @returns
   */
  async store(
    user_id: string,
    type: "like" | "comment" | "comment-like" | "follow" | "alert",
    description: string,
    link_id = "",
    highlight_id = "",
    username = ""
  ) {
    try {
      if (link_id !== "" && highlight_id !== "") {
        await NotificationModel.create({
          user_id: ObjectId(user_id),
          link_id: ObjectId(link_id),
          highlight_id: ObjectId(highlight_id),
          type,
          description,
          notified: false
        });
      } else if (link_id === "" && highlight_id !== "") {
        throw new Error(
          "if highlight_id is provided, link_id has to be provided too"
        );
      } else if (username !== "") {
        await NotificationModel.create({
          user_id: ObjectId(user_id),
          username,
          type,
          description,
          notified: false
        });
      }
    } catch (err) {
      return err;
    }
  }
  async markAllAsRead(req: Request, res: Response) {
    const { x_auth_id: id} = req.headers;

    try {
      await NotificationModel.updateMany(
        { user_id: id },
        {
          $set: {
            viewed: true,
          },
        }
      );
      return res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json("server error");
    }
  }
  async markOneAsRead(req: Request, res: Response) {
    const { notificationId } = req.body;
    try {
      let updatedNotification = await NotificationModel.findOneAndUpdate(
        { _id: ObjectId(notificationId) },
        {
          $set: { viewed: true },
        },
        {
          projection: {
            __v: 0,
            notified: 0,
          },
          new: true,
        }
      );
      res.status(200).json(updatedNotification);
    } catch (err) {
      res.status(500).json("server error");
    }
  }
}

export default new NotificationController();

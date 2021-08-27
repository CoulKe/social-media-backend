import mongoose from "mongoose";

const NotificationModel = new mongoose.Schema({
  // user to notify
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // post/ follower id
  link_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  // Where link_id isn't needed like for follows
  username: {
    type: String,
    required: false,
  },
  // for comments, returns what comment to highlight.
  highlight_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  // type of notification: "like" | "comment" | "comment-like" | "follower" | "alert"
  type: {
    type: String,
    required: true,
  },
  // notification text
  description: {
    type: String,
    required: true,
  },
  // Whether notification has been viewed or not
  viewed: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Whether user has been notified or not
  notified: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Date notification was created/updated
  date_updated: {
    type: Date,
    required: true,
    default: new Date().getTime(),
  },
});

export default mongoose.models.NotificationModel ||
  mongoose.model("Notifications", NotificationModel);

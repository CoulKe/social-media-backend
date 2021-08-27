import mongoose from "mongoose";

const MessageModel = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  chat_name: {
    type: String,
    required: true,
  },
  received: {
    type: Boolean,
    default: false,
  },
  date_created: {
    type: Date,
    default: new Date().getTime(),
  },
});

export default mongoose.models.MessageModel ||
  mongoose.model("Messages", MessageModel);

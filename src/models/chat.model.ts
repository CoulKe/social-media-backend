import mongoose from "mongoose";

const ChatModel = new mongoose.Schema({
  chat_name: {
    type: String,
    required: true,
    unique: true,
  },
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  chat_snippet: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  notified: {
    type: Boolean,
    default: false,
  },
  date_updated: {
    type: Date,
    required: true,
  },
  date_created: { type: Date, default: Date.now() },
});

export default mongoose.models.Chat || mongoose.model("Chat", ChatModel);

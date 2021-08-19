import mongoose from "mongoose";

const PostModel = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  post: {
    type: String,
    required: true,
  },
  likes: { type: Number, required: true },
  comments: { type: Number, required: true },
  isPinned: { type: Boolean, default: false},
  date_created: {
    type: Date,
    default: Date.now(),
  },
  date_updated: {
    type: Date,
  },
});

export default mongoose.models.Posts || mongoose.model("Posts", PostModel);

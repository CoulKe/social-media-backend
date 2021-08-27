import mongoose from "mongoose";

const CommentLikeModel = new mongoose.Schema({
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Comments",
  },
  username: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  date_updated: {
    type: Date,
  },
});

export default mongoose.models.Comment_likes ||
  mongoose.model("Comment_likes", CommentLikeModel);

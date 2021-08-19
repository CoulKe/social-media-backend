import mongoose from "mongoose";

const PostLikeModel = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Posts",
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

export default mongoose.models.Post_likes ||
  mongoose.model("Post_likes", PostLikeModel);

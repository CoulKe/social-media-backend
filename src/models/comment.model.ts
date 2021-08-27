import mongoose from "mongoose";
const CommentModel = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  date_created: {
    type: Date,
    default: new Date().getTime(),
  },
  date_updated: {
    type: Date,
    default: new Date().getTime(),
  },
});

export default mongoose.models.CommentModel ||
  mongoose.model("Comments", CommentModel);

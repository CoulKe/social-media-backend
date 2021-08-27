import mongoose from "mongoose";

const FollowsModel = new mongoose.Schema({
  follower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  followed_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  date_created: { type: Date, default: Date.now() },
});

export default mongoose.models.FollowsModel ||
  mongoose.model("Follows", FollowsModel);

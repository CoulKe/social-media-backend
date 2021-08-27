import mongoose from "mongoose";

const UserModel = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String
  },
  residence:{
    type: String
  },
  school:{
    type: String
  },
  password: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.UserModel || mongoose.model("Users", UserModel);

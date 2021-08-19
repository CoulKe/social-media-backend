import mongoose from "mongoose";

const TokenModel = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  personal_access_tokens: {
    type: Array,
  },
  personal_refresh_tokens: {
    type: Array,
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TokenModel || mongoose.model("Tokens", TokenModel);
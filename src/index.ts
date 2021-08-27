import express from "express";
import connectDB from "./config/index.model";
import dotenv from "dotenv";
import cors from "cors";

//Read .env variables
dotenv.config();

//Routes
import auth from "./routes/auth";
import posts from "./routes/posts";
import profile from "./routes/profile";
import messages from "./routes/messages";
import chats from "./routes/chats";
import postLikes from "./routes/post-likes";
import commentLikes from "./routes/comment-likes";
import comments from "./routes/comments";
import notifications from "./routes/notifications";
import search from "./routes/search";
import hashtags from "./routes/hashtags";

import {
  followRouter,
  followersRouter,
  followingsRouter,
} from "./routes/follows";
//env variables
const clientUrl: string = `${process.env.CLIENT_URL}`;

// Db connection
connectDB();
//Start express
const app = express();
const PORT = process.env.PORT || 9000;

//Fixing cors
var corsOptions = {
  origin: clientUrl,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/", auth);
app.use("/posts", posts);
app.use("/profile", profile);
app.use("/messages", messages);
app.use("/chats", chats);
app.use("/post-likes", postLikes);
app.use("/follow", followRouter);
app.use("/followers", followersRouter);
app.use("/followings", followingsRouter);
app.use("/comments", comments);
app.use("/comment-likes", commentLikes);
app.use("/notifications", notifications);
app.use("/search", search);
app.use("/hashtags", hashtags);

//Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

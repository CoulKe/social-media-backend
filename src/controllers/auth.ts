/**Controller for login and registration. */

import { Request, Response } from "express";
import { compare, hash } from "bcrypt";
import mongoose from "mongoose";
import Cookies from "cookies";
import { validationResult } from "express-validator";
import UserModel from "../models/user.model";
import NotificationController from "./notification";
import dotenv from "dotenv";
import { setAuthTokens } from "../utils/database";

// Don't use 'import', this jwt version throws type errors at some places.
const jwt = require("jsonwebtoken");
//For reading .env files
dotenv.config();

export const RegisterController = async (req: Request, res: Response) => {
  const { fName, lName, username, email, password } = req.body;
  //Check and set errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  //Check if the username is available
  let existingUser = await UserModel.exists({ username: username });
  let existingEmail = await UserModel.exists({ email: email });

  // usernames are unique
  if (existingUser) {
    return res.status(422).json({
      errors: [
        {
          msg: "This user already exists",
          param: "username",
          location: "body",
          value: username,
        },
      ],
    });
  }
  // Emails are unique
  if (existingEmail) {
    return res.status(422).json({
      errors: [
        {
          msg: "This email is already registered",
          param: "email",
          location: "body",
          value: email,
        },
      ],
    });
  }
  // Save to the database
  try {
    const hashedPassword = await hash(password, 10);
    let fNameFirstLetter = fName.charAt(0).toUpperCase();
    let lNameFirstLetter = lName.charAt(0).toUpperCase();

    // Capitalize the names first letter
    let first_name = fNameFirstLetter.concat(fName.substr(1));
    let last_name = lNameFirstLetter.concat(lName.substr(1));

    await UserModel.create({
      first_name,
      last_name,
      username: username,
      email: email,
      password: hashedPassword,
    });
    let { _id } = await UserModel.findOne({ username });

    // Create a notification to welcome the user.
    await NotificationController.store(
      _id,
      "alert",
      `Welcome ${fName} ${lName}. Thank you for joining.`
    );

    return res.status(200).json({ msg: "success" });
  } catch (e) {
    return res.status(500).json({
      errors: [
        { msg: "Sorry, there was an internal server error. Try again later" },
      ],
    });
  }
};

export const LoginController = async (req: Request, res: Response) => {
  let { username, password } = req.body;
  username = username.toString();
  password = password.toString();

  try {
    if (!password) return res.status(401).json({ msg: "Invalid credentials" });

    let user = await UserModel.findOne(
      {
        username,
      },
      { __v: 0, email: 0 }
    );

    if (!user) return res.status(401).json({ msg: "Invalid credentials" });
    let hashedPassword = user.password;
    let isMatch = await compare(password, hashedPassword);
    //Password is wrong
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    let cookie = new Cookies(req, res);
    const [accessToken, refreshToken] = setAuthTokens(username, user._id);

    let expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

    cookie.set("id", user._id, {
      httpOnly: false,
      expires: expiryDate,
    });
    cookie.set("username", user.username, {
      httpOnly: false,
      expires: expiryDate,
    });
    cookie.set("refreshToken", refreshToken, {
      httpOnly: true,
      expires: expiryDate,
    });

    return res.status(200).json({ username, id: user._id, accessToken });
  } catch (err) {
    res.status(500).json("server error");
  }
};
export const RefreshTokens = async (req: Request, res: Response) => {
  const cookie = new Cookies(req, res);
  let id = cookie.get("id");
  let oldRefreshToken = cookie.get("refreshToken");
  let username = cookie.get("username");

  if (!id || !username || !oldRefreshToken) {
    return res.status(401).json({ msg: "Session expired" });
  }

  try {
    let secret = process.env.ACCESS_TOKEN_SECRET || "";
    let verifiedToken = jwt.verify(oldRefreshToken, secret);

    // If access token is corrupt log out.
    if (verifiedToken?.username !== username){
      return res.status(403).json({ msg: "Session expired" });
    }

    let expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

    const [accessToken, refreshToken] = setAuthTokens(username, id);

    cookie.set("refreshToken", refreshToken, {
      httpOnly: true,
      expires: expiryDate,
    });

    res.status(200).json({ accessToken });

  } catch (error) {
    return res.status(401).json({ msg: "Session expired" });
  }
};
/**
 * Gets all cookies and delete.
 */
export const LogoutController = async (req: Request, res: Response) => {
  try {
    let cookies = req?.headers?.cookie?.split(/;/) || [];
    cookies.forEach((cookie: string) => {
      res.clearCookie(cookie.split("=")[0]);
    });

    res.status(200).json({ msg: "Successfully logged out" });
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

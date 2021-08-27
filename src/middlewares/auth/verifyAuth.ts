/**Middleware for verifying user is authorized. */

import Cookies from "cookies";
import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "../../utils/checkValidity";

// Dont use 'import' here, this jwt version throws type errors at some places.
var jwt = require("jsonwebtoken");

export default function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let cookie = new Cookies(req, res);
  let username = cookie.get("username");
  let id = cookie.get("id") || "";
  let accessToken = req?.headers?.authorization?.split(" ")[1];
  let refreshToken = cookie.get("refreshToken");
  let secret = process.env.ACCESS_TOKEN_SECRET || "";

  let isValidId = isValidObjectId(id);

  if (!username || !isValidId)
    return res.status(403).json({ msg: "Invalid credentials" });
  if (!accessToken) {
    return res.status(403).json({ msg: "Invalid credentials" });
  }
  if (!refreshToken) {
    return res.status(403).json({ msg: "Invalid credentials" });
  }

  //Check if accessToken is valid.
  try {
    if (!accessToken)
      return res.status(403).json({ msg: "Invalid credentials" });
    let verifiedAccessToken = jwt.verify(accessToken, secret);

    // If access token is corrupt log out.
    if (verifiedAccessToken.username !== username)
      return res.status(403).json({ msg: "Invalid credentials" });
  } catch (e) {
    // If access token is invalid log out.
    return res.status(403).json({ msg: "Invalid credentials" });
  }
  next();
}

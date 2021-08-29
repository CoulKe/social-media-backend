/**Middleware for verifying user is authorized. */

import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "../../utils/checkValidity";

// Dont use 'import' here, this jwt version throws type errors at some places.
var jwt = require("jsonwebtoken");

export default function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {x_auth_username: username, x_auth_id: id=""} = req.headers;
  let accessToken = req?.headers?.authorization?.split(" ")[1];
  let refreshToken = req.header('x_refresh');
  let secret = process.env.ACCESS_TOKEN_SECRET || "";

  let isValidId = isValidObjectId(id.toString());

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

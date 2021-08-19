import jwt from "jsonwebtoken";
import mongoose from "mongoose";



/**
 * Creates new access token and refresh token respectively.
 * `Tip`: Use destructuring to get both the values.
 * @param username - Username of the logged user.
 * @param user_id - Id of the logged user.
 * @returns [accessToken, refreshToken]
 */
export function setAuthTokens(username: string, user_id: string) {
  let accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET || "";
  let refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET || "";
  
  let accessToken = jwt.sign(
    {
      username,
      id: user_id,
    },
    accessTokenSecret,
    { expiresIn: "900s" }
  );
  let refreshToken = jwt.sign(
    {
      username,
      id: user_id,
    },
    refreshTokenSecret,
    { expiresIn: "7d" }
  );

  return [accessToken, refreshToken];
}

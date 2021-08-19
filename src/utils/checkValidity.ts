const ObjectId = require("mongoose").Types.ObjectId;
/**
 * Checks if a string is a valid mongo db ObjectId.
 * 
 * Credit: {@link https://www.geeksforgeeks.org/how-to-check-if-a-string-is-valid-mongodb-objectid-in-nodejs `Geeks for geeks`}
 * */
export function isValidObjectId(id: string) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}
/**
 * Checks if jwt token is still valid.
 * @param token - jwt token
 * @returns boolean
 */
export function hasTokenExpired(token: any) {
  let currentTime = new Date().getTime() / 1000;
  if (currentTime > token.exp) {
    return true;
  }
  return false;
}

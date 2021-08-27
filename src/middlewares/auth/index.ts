/**Login and registration middleware. */

import { Request, Response, NextFunction } from "express";
import { check } from "express-validator";

export const registerValidate = [
  check("fName", "Name too short").isLength({ min: 1 }),
  check("lName", "Name too short").isLength({ min: 1 }),
  check("username", "Username too short")
    .isLength({ min: 1 })
    .custom((val) => !val.includes("@"))
    .withMessage("'@' symbol is not allowed")
    .custom((val) => val.split(" ").length < 2)
    .withMessage("Spaces not allowed"),
  check("email", "Invalid email").isEmail(),
  check("password", "Password should be more than 6 characters")
    .isLength({
      min: 6,
    })
    .custom((val, { req }) => val === req.body.passwordConfirm)
    .withMessage("Passwords do not match"),
];
// passwordConfirm
export function loginValidate(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;
  //If password or username is empty
  if (!username || !password)
    return res.status(401).json({ msg: "Invalid credentials" });
  next();
}

import jwt from "jsonwebtoken";

import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

import User from "../models/user.js";

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  console.log(authorization);
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    throw HttpError(401);
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);
    console.log(user);
    if (!user || !user.token) {
      // console.log("lolo");
      throw HttpError(401);
    }
    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401));
  }
};

export default ctrlWrapper(authenticate);

import fs from "fs/promises";
import path from "path";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";

import User from "../models/user.js";

import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

const { JWT_SECRET } = process.env;

const avatarsPath = path.resolve("public", "avatars");

const changeAvatar = async (req, res) => {
  const { _id } = req.user;

  const { path: oldPath, filename } = req.file;
  const pic = await Jimp.read(oldPath);
  const resizedPic = pic.resize(250, 250);
  resizedPic.write(oldPath);
  const newPath = path.join(avatarsPath, filename);
  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("public", "avatars", filename);
  // console.log(avatarURL);
  const result = await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({
    avatarURL: result.avatarURL,
  });
};

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, `${email} already in use `);
  }
  const avatarURL = gravatar.url(email);

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    email: newUser.email,
    avatarURL: newUser.avatarURL,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { subscription, email } = req.user;
  console.log(req.user);
  res.json({
    email,
    subscription,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  changeAvatar: ctrlWrapper(changeAvatar),
};

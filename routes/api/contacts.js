import express from "express";
import contactsController from "../../controllers/contacts-controller.js";
import { Schema, model } from "mongoose";
import { HttpError } from "../../helpers/index.js";
import Joi from "joi";
import {
  authenticate,
  isEmptyBody,
  isValidId,
} from "../../middlewares/index.js";
import { validateBody } from "../../decorators/index.js";
const router = express.Router();

const contactAddSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `missing required name field`,
  }),
  email: Joi.string().email().required().messages({
    "any.required": `missing required email field`,
  }),
  phone: Joi.string()
    .pattern(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/, "numbers")
    .required()
    .messages({
      "any.required": `missing required phone field`,
    }),
  owner: {
    type: Schema.Types.ObjectId,

    ref: "user",
    required: true,
  },
  favorite: Joi.boolean(),
});

const contactUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean()
    .required()
    .messages({ "any.required": "missing field favorite" }),
});

const contactAddValidate = validateBody(contactAddSchema);

const contactValidateFavorite = validateBody(contactUpdateFavoriteSchema);

router.use(authenticate);

router.get("/", contactsController.getAll);

router.get("/:contactId", isValidId, contactsController.getById);

router.post("/", isEmptyBody, contactAddValidate, contactsController.add);

router.delete("/:contactId", isValidId, contactsController.deleteById);

router.patch(
  "/:contactId/favorite",
  isValidId,
  contactValidateFavorite,
  contactsController.updateFavorite
);

router.put(
  "/:contactId",
  isValidId,
  isEmptyBody,
  contactAddValidate,
  contactsController.updateById
);

export default router;

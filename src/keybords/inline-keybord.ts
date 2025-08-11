import { InlineKeyboard } from "grammy";
import { KEYBOARDS } from "../typings/enums/keyboards";
import { IUser } from "../models/user.model";

export const backInlineKeyboard = () =>
  new InlineKeyboard().text(KEYBOARDS.BACK, KEYBOARDS.BACK);

export const backOrSkipInlineKeyboard = () =>
  new InlineKeyboard()
    .row()
    .text(KEYBOARDS.BACK, KEYBOARDS.BACK)
    .row()
    .text(KEYBOARDS.SKIP, KEYBOARDS.SKIP);

export const userInlineKeyboard = (user: IUser) =>
  new InlineKeyboard()
    .row()
    .text(KEYBOARDS.ADD_CASHBACK, `${KEYBOARDS.ADD_CASHBACK}:${user._id}`)
    .row()
    .text(
      KEYBOARDS.REMOVE_CASHBACK,
      `${KEYBOARDS.REMOVE_CASHBACK}:${user._id}`
    );

export const askMediaTypeInlineKeyboard = () =>
  new InlineKeyboard()
    .row()
    .text(KEYBOARDS.SKIP, KEYBOARDS.SKIP)
    .row()
    .text(KEYBOARDS.PHOTO, KEYBOARDS.PHOTO)
    .text(KEYBOARDS.VIDEO, KEYBOARDS.VIDEO);

export const askYesNoInlineKeyboard = () =>
  new InlineKeyboard()
    .row()
    .text(KEYBOARDS.BACK, KEYBOARDS.BACK)
    .row()
    .text(KEYBOARDS.YES, KEYBOARDS.YES)
    .text(KEYBOARDS.NO, KEYBOARDS.NO)

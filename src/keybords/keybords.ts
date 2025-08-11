import { Keyboard } from "grammy";
import { KEYBOARDS } from "../typings/enums/keyboards";

export const mainKeyboard = () =>
  new Keyboard()
    .row()
    .text(KEYBOARDS.PROFILE)
    .text(KEYBOARDS.ABOUT_US)
    .row()
    .text(KEYBOARDS.SEND_FEEDBACK)
    .resized();

export const adminKeyboard = () =>
  new Keyboard()
    .row()
    .text(KEYBOARDS.STATISTICS)
    .text(KEYBOARDS.FIND_USER)
    .row()
    .text(KEYBOARDS.NEW_MESSAGE)
    .resized();

export const sendContactKeyboard = () =>
  new Keyboard()
    .requestContact(KEYBOARDS.SEND_CONTACT)
    .row()
    .text(KEYBOARDS.BACK)
    .resized();

export const backKeyboard = () => new Keyboard().text(KEYBOARDS.BACK).resized();

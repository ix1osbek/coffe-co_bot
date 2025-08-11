import { model, Schema } from "mongoose";
import { MODELS } from "../typings/enums/models";

export interface IUser {
  _id: string;
  chat_id: number;
  customer_id: string;
  name: string;
  username?: string;
  phone: string;
  role: RoleUser;
  total_points: number;
  is_active: boolean;
}

export enum RoleUser {
  USER = "user",
  ADMIN = "admin",
}

const UserSchema = new Schema<IUser>(
  {
    chat_id: {
      type: "number",
      required: true,
      unique: true,
    },
    customer_id: {
      type: "string",
      required: true,
    },
    name: {
      type: "string",
      required: true,
    },
    username: {
      type: "string",
      required: false,
    },
    phone: {
      type: "string",
      required: true,
      unique: true,
    },
    role: {
      type: "string",
      enum: RoleUser,
      default: RoleUser.USER,
    },
    total_points: {
      type: "number",
      default: 0,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
  },
  { versionKey: false }
);

export const User = model<IUser>(MODELS.USER, UserSchema);

import { ScenesSessionData } from "grammy-scenes";
import { IUser } from "../../models/user.model";

export interface SessionData extends ScenesSessionData {
  user: IUser
}

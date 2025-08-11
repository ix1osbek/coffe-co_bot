import { IUser } from "../../models/user.model";

export interface IUpdateCashbackSession {
  user?: IUser;
  action?: string;
}

import { Context, SessionFlavor } from "grammy";
import { ScenesFlavor } from "grammy-scenes";
import { SessionData } from "../interfaces/session";

export interface MyContext
  extends Context,
    SessionFlavor<SessionData>,
    ScenesFlavor {}

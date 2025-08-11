import { ScenesComposer } from "grammy-scenes";
import { MyContext } from "../typings/interfaces/my-contex";
import { mainScene } from "./main";
import { authScene } from "./auth";
import { submitFeedbackScene } from "./submit-feedback";
import { adminScenes } from "./admin";

export const scenes = new ScenesComposer<MyContext>(
  authScene,
  mainScene,
  submitFeedbackScene,
  ...adminScenes
);

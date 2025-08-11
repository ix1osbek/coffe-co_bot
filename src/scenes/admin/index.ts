import { adminScene } from "./admin";
import { findUserScene } from "./find-user";
import { newMessageScene } from "./new-message";
import { statisticsScene } from "./statistics";
import { updateCashbackScene } from "./update-cashback";

export const adminScenes = [
  adminScene,
  statisticsScene,
  findUserScene,
  updateCashbackScene,
  newMessageScene,
];

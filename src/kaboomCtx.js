import kaboom from "kaboom";
import { scaleFactor } from "./constants";

export const k = kaboom({
    global: false,
    touchToMouse: true,     //translate mouse and touch events with mobile
    canvas: document.getElementById("game"),
    debug: false,
});
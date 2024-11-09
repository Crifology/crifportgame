import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    touchToMouse: true,     //translate mouse and touch events with mobile
    canvas: document.getElementById("game"),
});
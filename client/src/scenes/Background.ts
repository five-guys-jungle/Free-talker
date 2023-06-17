import Phaser from "phaser";
import { openLogin } from "../stores/gameSlice";
import store from "../stores";

export default class Background extends Phaser.Scene {
    constructor() {
        super("background");
        // this.clouds = [];
    }

    preload() {
        this.load.image("background", "assets/backgrounds/space.png");

        console.log("preloading..............");
    }

    create() {
        this.add.image(3840, 2880, "background");
        store.dispatch(openLogin());
    }

    update() {
        console.log("update!!!!!!!!!");
    }
}

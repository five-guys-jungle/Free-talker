import Phaser from "phaser";
import { openLogin } from "../stores/gameSlice";
import store from "../stores";

export default class Background extends Phaser.Scene {
    constructor() {
        super("background");
        // this.clouds = [];
    }

    preload() {
        console.log("preloading..............");
        this.load.image("background", "assets/backgrounds/space.png");

        this.load.image("background", "assets/backgrounds/space.png");
        this.load.image("generic", "assets/tilesets/Generic.png");
        this.load.image("basement", "assets/tilesets/Basement.png");
        this.load.image("floor", "assets/tilesets/FloorAndGround.png");
        this.load.image("interior", "assets/tilesets/Interiors.png");
        this.load.image(
            "pixel",
            "assets/tilesets/pixel-cyberpunk-interior.png"
        );
        this.load.image(
            "classroom",
            "assets/tilesets/Classroom_and_library.png"
        );
        this.load.image(
            "exterior",
            "assets/tilesets/ModernExteriorsComplete.png"
        );
        this.load.tilemapTiledJSON("map1", "assets/maps/usa.json");
        this.load.spritesheet("npc", "assets/characters/npc.png", {
            frameWidth: 48,
            frameHeight: 72,
            startFrame: 0,
            endFrame: 12,
        });
        this.load.spritesheet("adam", "assets/characters/adam.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("ash", "assets/characters/ash.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("lucy", "assets/characters/lucy.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("nancy", "assets/characters/nancy.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

        this.load.tilemapTiledJSON("map", "assets/maps/airport.json");

        console.log("Complete loading!!!!!!!!!!!!!!!");
    }

    create() {
        this.add.image(0, 0, "background");
        store.dispatch(openLogin());
    }

    update() {
        console.log("update!!!!!!!!!");
    }
}

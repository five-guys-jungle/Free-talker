import Phaser from "phaser";
import { openLogin } from "../stores/gameSlice";
import store from "../stores";


export default class Background extends Phaser.Scene {
    
    
    
    background!:Phaser.GameObjects.Image

    constructor() {
        super("background");
        // this.clouds = [];
    }

    preload() {
        console.log("preloading..............");
        this.load.image("background", "assets/backgrounds/sky.jpg");
        this.load.image("statueOfLiberty", "assets/characters/statue-of-liberty.png");
        this.load.spritesheet("immigrationOfficer", "assets/characters/immigrationOfficer.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        

        // this.load.image("background", "assets/backgrounds/space.png");
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
        this.load.spritesheet("npc", "assets/characters/npc.png", {
            frameWidth: 48,
            frameHeight: 72,
            startFrame: 0,
            endFrame: 12,
        });
        this.load.spritesheet("jinhoman", "assets/characters/jinhoman.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("jinhogirl", "assets/characters/jinhogirl.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("seunghun", "assets/characters/seunghun.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("doyoungboy", "assets/characters/doyoungboy.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("minsook", "assets/characters/minsook.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.image(
            "exterior",
            "assets/tilesets/ModernExteriorsComplete.png"
        );
        this.load.image(
            "fiveguys_Exteriors",
            "assets/tilesets/fiveguys_Exteriors.png"
        );
        this.load.image(
            "fiveguys_Interiors_1",
            "assets/tilesets/fiveguys_Interiors_1.png"
        );
        this.load.image(
            "fiveguys_Interiors_2",
            "assets/tilesets/fiveguys_Interiors_2.png"
        );
        this.load.image(
            "fiveguys_Interiors_3",
            "assets/tilesets/fiveguys_Interiors_3.png"
        );
        this.load.image(
            "fiveguys_Interiors_4",
            "assets/tilesets/fiveguys_Interiors_4.png"
        );
        
        this.load.image(
            "fiveguys_Room_Builder",
            "assets/tilesets/fiveguys_Room_Builder.png"
        );

        
        console.log("Complete loading!!!!!!!!!!!!!!!");
    }

    create() {
        
        this.background = this.add
            .image(0, 0, "background")
            .setDisplaySize(this.game.scale.width, this.game.scale.height)
            .setOrigin(0, 0);
        // this.add.image(0, 0, "background").setOrigin(0, 0);
        store.dispatch(openLogin());
    }

    update() {
        // console.log("update!!!!!!!!!");
        this.background
            .setDisplaySize(this.game.scale.width, this.game.scale.height)
            .setOrigin(0, 0);
    }
}
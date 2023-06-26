import Phaser from "phaser";
import { openLogin } from "../stores/gameSlice";
import store from "../stores";
import phaserGame from "../phaserGame";
import AirportScene from "./Airport";
import USAScene from "./USA";

export default class Background extends Phaser.Scene {
    background!: Phaser.GameObjects.Image;

    constructor() {
        super("background");
        // this.clouds = [];
    }

    preload() {
        console.log("preloading..............");
        this.load.image("background", "assets/backgrounds/sky.jpg");
        this.load.image(
            "statueOfLiberty",
            "assets/characters/statue-of-liberty.png"
        );
        this.load.image("coach_park", "assets/characters/coach_sprite.png");
        this.load.image("chairMart", "assets/characters/chairMart.png");
        this.load.spritesheet(
            "ImmigrationOfficer",
            "assets/characters/ImmigrationOfficer.png",
            {
                frameWidth: 32,
                frameHeight: 48,
            }
        );

        this.load.spritesheet("Chef", "assets/characters/Chef.png", {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet("Waitress", "assets/characters/Waitress.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet(
            "MartCashier",
            "assets/characters/MartCashier.png",
            {
                frameWidth: 32,
                frameHeight: 48,
            }
        );

        this.load.spritesheet(
            "HotelReceptionist",
            "assets/characters/HotelReceptionist.png",
            {
                frameWidth: 32,
                frameHeight: 48,
            }
        );

        this.load.spritesheet(
            "ClothingShopStaff",
            "assets/characters/ClothingShopStaff.png",
            {
                frameWidth: 32,
                frameHeight: 48,
            }
        );

        this.load.spritesheet("Doctor", "assets/characters/Doctor.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

        this.load.spritesheet("Nurse", "assets/characters/Nurse.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

        this.load.spritesheet("Barista", "assets/characters/Barista.png", {
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
        this.load.spritesheet("minsik", "assets/characters/minsik.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

        this.load.spritesheet('gate', 'assets/gate.png', {
             frameWidth: 64, 
             frameHeight: 64 
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
        this.load.image("fiveguys_logo", "assets/tilesets/fiveguys_logo.png");

        console.log("Complete loading!!!!!!!!!!!!!!!");
    }

    gamePause() {
        console.log("Game is paused");
        for (let scene of phaserGame.scene.getScenes()) {
            const sceneKey = scene.scene.key;
            if (phaserGame.scene.isActive(sceneKey)) {
                const resumedScene: Phaser.Scene = phaserGame.scene.getScene(sceneKey);
                switch(sceneKey){
                    case "AirportScene":
                        const beforePauseXAirport:number = (resumedScene as AirportScene).player1!.x;
                        const beforePauseYAirport:number = (resumedScene as AirportScene).player1!.y;
                        (resumedScene as AirportScene).gamePause(beforePauseXAirport, beforePauseYAirport);
                        break;
                    case "USAScene":
                        const beforePauseXUSA:number = (resumedScene as USAScene).player1!.x;
                        const beforePauseYUSA:number = (resumedScene as USAScene).player1!.y;
                        (resumedScene as USAScene).gamePause(beforePauseXUSA, beforePauseYUSA);
                }
            }
        }
    }

    gameResume() {
        console.log("Game is resumed");
        for (let scene of phaserGame.scene.getScenes()) {
            const sceneKey = scene.scene.key;
            if (phaserGame.scene.isActive(sceneKey)) {
                const resumedScene: Phaser.Scene = phaserGame.scene.getScene(sceneKey);
                switch(sceneKey){
                    case "AirportScene":
                        const beforePauseXAirport:number = (resumedScene as AirportScene).player1!.x;
                        const beforePauseYAirport:number = (resumedScene as AirportScene).player1!.y;
                        (resumedScene as AirportScene).gameResume(beforePauseXAirport, beforePauseYAirport);
                        break;
                    case "USAScene":
                        const beforePauseXUSA:number = (resumedScene as USAScene).player1!.x;
                        const beforePauseYUSA:number = (resumedScene as USAScene).player1!.y;
                        (resumedScene as USAScene).gameResume(beforePauseXUSA, beforePauseYUSA);
                }
            }
        }
    }

    create() {
        // 'pause' 이벤트를 처리하는 리스너 추가
        // this.game.events.on('pause', this.gamePause.bind(this));

        // 'resume' 이벤트를 처리하는 리스너 추가
        this.game.events.on('resume', this.gameResume);

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

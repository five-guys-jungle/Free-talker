import AirportScene from "./scenes/Airport";
// import USScene from "../scenes/US";
import Background from "./scenes/Background";
import USAScene from "./scenes/USA";
import Phaser from "phaser";
import { GameType } from "./types";
import axios from "axios";
import dovenv from "dotenv";
let DB_URL: string = process.env.REACT_APP_SERVER_URL!;

// declare module '*.png';

const config = {
    // width: "100%", //  scene이 그려지는 canvas의 width 값
    // height: "100%", //  scene이 그려지는 canvas의 height 값
    // backgroundColor: '#EEEEEE', //  scene이 그려지는 canvas의 backgroundColor 값
    type: Phaser.AUTO,
    parent: "phaser-container",
    scene: [Background, AirportScene, USAScene],
    scale: {
        // mode: Phaser.Scale.FIT,
        mode: Phaser.Scale.ScaleModes.RESIZE,
        // width: ,
        // height: 2880,
        width: "100wh",
        height: "100vh",
    },
    physics: {
        default: "arcade",
        arcade: {
            // debug: true, // 배포 시 주석 처리 (메타버스 디버그 모드)
            gravity: { y: 0 },
        },
    },
    // pixelArt: true,
};

let phaserGame: GameType = new Phaser.Game(config);
window.onbeforeunload = async () => {
    for (let scene of phaserGame.scene.getScenes()) {
        const sceneKey = scene.scene.key;
        if (phaserGame.scene.isActive(sceneKey)) {
            let activeScene = phaserGame.scene.getScene(sceneKey) as AirportScene | USAScene;
            activeScene.socket?.disconnect();
            console.log("beforeunload");
            const body = { userId: activeScene.playerId }
            axios.post(`${DB_URL}/auth/logout`, body);
            break;
        }
    }
};


export default phaserGame;

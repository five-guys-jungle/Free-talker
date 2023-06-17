import phaserGame from "../../phaserGame";
import store from "../../stores";
import {
    openAirport,
    openNPCDialog,
    openStart,
    openUS,
} from "../../stores/gameSlice";
import { GAME_STATUS } from "../../stores/gameSlice";

import phaser from "phaser";

export const handleScene = async (statusTo: string, data: any = {}) => {
    switch (statusTo) {
        case GAME_STATUS.START:
            store.dispatch(openStart());
            for (let scene of phaserGame.scene.getScenes()) {
                const sceneKey = scene.scene.key;
                if (phaserGame.scene.isActive(sceneKey))
                    phaserGame.scene.sleep(sceneKey);
            }
            break;
        case GAME_STATUS.AIRPORT:
            store.dispatch(openAirport());
            console.log("open AirPort, data : ", data);
            phaserGame.scene.sleep("background");
            phaserGame.scene.start("AirportScene", data);

            const activeSceneKeys = phaserGame.scene.getScenes();
            for (let scene of activeSceneKeys) {
                const sceneKey = scene.scene.key;
                if (phaserGame.scene.isActive(sceneKey))
                    console.log("Active Scene:", sceneKey);
            }
            // console.log("Active scenes:", activeSceneKeys);
            break;

        case GAME_STATUS.NPCDIALOG:
            store.dispatch(openNPCDialog());
            break;

        case GAME_STATUS.US:
            store.dispatch(openUS());
    }
};

// Background, AirportScene, USScene

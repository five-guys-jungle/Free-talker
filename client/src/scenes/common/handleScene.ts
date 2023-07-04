import phaserGame from "../../phaserGame";
import store from "../../stores";
import {
    openAirport,
    openFreedialog,
    openNPCDialog,
    openStart,
    openUSA,
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
            for (let scene of phaserGame.scene.getScenes()) {
                const sceneKey = scene.scene.key;
                if (phaserGame.scene.isActive(sceneKey)) {
                    phaserGame.scene.sleep(sceneKey);
                    if (phaserGame.scene.isSleeping("AirportScene")) {
                        phaserGame.scene.wake("AirportScene", data);
                        break;
                    } else {
                        phaserGame.scene.start("AirportScene", data);
                        break;
                    }
                }
            }
            break;

        case GAME_STATUS.NPCDIALOG:
            store.dispatch(openNPCDialog());
            break;

        case GAME_STATUS.FREEDIALOG:
            store.dispatch(openFreedialog());
            break;
        case GAME_STATUS.USA:
            store.dispatch(openUSA());
            for (let scene of phaserGame.scene.getScenes()) {
                const sceneKey = scene.scene.key;
                if (phaserGame.scene.isActive(sceneKey)) {
                    phaserGame.scene.sleep(sceneKey);
                    if (phaserGame.scene.isSleeping("USAScene")) {
                        phaserGame.scene.wake("USAScene", data);
                        break;
                    } else {
                        phaserGame.scene.start("USAScene", data);
                        break;
                    }
                }
            }
            break;
    }
};

// Background, AirportScene, USScene

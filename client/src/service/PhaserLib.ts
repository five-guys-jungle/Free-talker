// import phaserGame from '../codeuk';
import store from "../stores";
import { openAirport } from "../stores/gameSlice";

const GAME_STATUS = {
    login: "login",
    airport: "airport",
};

export const handleScene = async (statusTo: string, data: any = {}) => {
    switch (statusTo) {
        // case GAME_STATUS.login:
        //   store.dispatch(openAirport());
        //   break;
        case GAME_STATUS.airport:
            store.dispatch(openAirport());
            break;
        //   for (let scene of phaserGame.scene.getScenes()) {
        //     const sceneKey = scene.scene.key;
        //     if (sceneKey !== 'background' && phaserGame.scene.isActive(sceneKey)) {
        //       phaserGame.scene.sleep(sceneKey);
        //     }
        //   }
        // if (phaserGame.scene.isSleeping('Start')) {
        //   phaserGame.scene.wake('Start');
        // } else {
        //   phaserGame.scene.start('Start');
        // }
    }
};
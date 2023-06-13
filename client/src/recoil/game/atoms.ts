import { atom } from "recoil";

export interface GameSceneState {
    scene: "login" | "airport";
}

export const gameSceneState = atom<GameSceneState>({
    key: "gameSceneState",
    default: { scene: "login" },
});

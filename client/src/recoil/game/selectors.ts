import { selector } from "recoil";
import { gameSceneState } from "./atoms";

export const setGameScene = selector({
    key: "setGameScene",
    get: ({ get }) => get(gameSceneState),
    set: ({ set }, newValue) => {
        set(gameSceneState, newValue);
    },
});

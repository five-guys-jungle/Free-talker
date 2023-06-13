import { selector } from "recoil";
// , useRecoilState, useRecoilValue
import {
    playerNicknameState,
    playerIdState,
    playerTextureState,
    // userLoginIdState,
} from "./atoms";

export const setPlayerNickname = selector({
    key: "setPlayerNickname",
    get: ({ get }) => get(playerNicknameState),
    set: ({ set }, newValue) => {
        set(playerNicknameState, newValue);
    },
});

export const setPlayerId = selector({
    key: "setPlayerId",
    get: ({ get }) => get(playerIdState),
    set: ({ set }, newValue) => {
        set(playerIdState, newValue);
    },
});

export const setPlayerTexture = selector({
    key: "setPlayerTexture",
    get: ({ get }) => get(playerTextureState),
    set: ({ set }, newValue) => {
        set(playerTextureState, newValue);
    },
});

// export const setUserLoginId = selector({
//     key: "setUserLoginId",
//     get: ({ get }) => get(userLoginIdState),
//     set: ({ set }, newValue) => {
//         set(userLoginIdState, newValue);
//     },
// });

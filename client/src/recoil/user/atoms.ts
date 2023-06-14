import { atom } from "recoil";

export const playerIdState = atom({
    key: "playerIdState",
    default: "",
});

export const playerTextureState = atom({
    key: "playerTextureState",
    default: "char0",
});

export const playerNicknameState = atom({
    key: "playerNicknameState",
    default: "Unknown",
});

export const userLoginIdState = atom({
    key: "userLoginIdState",
    default: "",
});

import { createSlice } from "@reduxjs/toolkit";

export const GAME_STATUS = {
    START: "START",
    LOGIN: "LOGIN",
    AIRPORT: "AIRPORT",
    US: "US",
    NPCDIALOG: "NPCDIALOG",
    USERDIALOG: "USERDIALOG",
};

export interface GameModeState {
    mode: string;
}

const initialState: GameModeState = {
    mode: GAME_STATUS.START,
};

export const GameModeSlice = createSlice({
    name: "mode",
    initialState,
    reducers: {
        openStart: (state) => {
            state.mode = GAME_STATUS.START;
        },
        openLogin: (state) => {
            state.mode = GAME_STATUS.LOGIN;
        },
        openAirport: (state) => {
            state.mode = GAME_STATUS.AIRPORT;
        },
        openUS: (state) => {
            state.mode = GAME_STATUS.US;
        },
        openNPCDialog: (state) => {
            state.mode = GAME_STATUS.NPCDIALOG;
        },
    },
});
export const { openAirport, openUS, openNPCDialog, openStart, openLogin } =
    GameModeSlice.actions;

export default GameModeSlice.reducer;

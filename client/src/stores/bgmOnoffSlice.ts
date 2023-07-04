// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface bgmOnoff {
    bgmonoff: boolean;
}

export const initialState: bgmOnoff = {
    bgmonoff: true,
};

export const bgmOnoffSlice = createSlice({
    name: "bgmonoff",
    initialState,
    reducers: {
        bgmOn: (state) => {
            state.bgmonoff = true;
        },
        bgmOff: (state) => {
            state.bgmonoff = false;
        },
    },
});

export const { bgmOn, bgmOff } = bgmOnoffSlice.actions;

export default bgmOnoffSlice.reducer;

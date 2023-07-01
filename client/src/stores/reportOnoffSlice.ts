// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface reportOnoff {
    reportonoff: boolean;
    presentScene: string;
    isButtonClicked: boolean;
}

export const initialState: reportOnoff = {
    reportonoff: false,
    presentScene: "airport",
    isButtonClicked: false,
};

export const reportOnoffSlice = createSlice({
    name: "reportonoff",
    initialState,
    reducers: {
        reportOn: (state, action: PayloadAction<string>) => {
            state.reportonoff = true;
            state.presentScene = action.payload;
        },
        reportOff: (state) => {
            state.reportonoff = false;
        },

        buttonClickedOn: (state) => {
            state.isButtonClicked = true;
        },
        buttonClickedOff: (state) => {
            state.isButtonClicked = false;
        },
    },
});

export const { reportOn, reportOff, buttonClickedOn ,buttonClickedOff } = reportOnoffSlice.actions;

export default reportOnoffSlice.reducer;

// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface reportOnoff {
    reportonoff: boolean;
    presentScene: string;
}

export const initialState: reportOnoff = {
    reportonoff: false,
    presentScene: "airport"
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
    },
});

export const { reportOn, reportOff } = reportOnoffSlice.actions;

export default reportOnoffSlice.reducer;

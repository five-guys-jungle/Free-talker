// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface reportOnoff {
    reportonoff: boolean;
}

export const initialState: reportOnoff = {
    reportonoff: false,
};

export const reportOnoffSlice = createSlice({
    name: "reportonoff",
    initialState,
    reducers: {
        reportOn: (state) => {
            state.reportonoff = true;
        },
        reportOff: (state) => {
            state.reportonoff = false;
        },
    },
});

export const { reportOn, reportOff } = reportOnoffSlice.actions;

export default reportOnoffSlice.reducer;

// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface reportOnoff {
    Onoff: boolean;
}

export const initialState: reportOnoff = {
    Onoff: true,
};

export const reportOnoffSlice = createSlice({
    name: "reportonoff",
    initialState,
    reducers: {
        OnreportOnoff: (state) => {
            state.Onoff = true;
        },
        OffreportOnoff: (state) => {
            state.Onoff = false;
        },
    },
});

export const { OnreportOnoff, OffreportOnoff } = reportOnoffSlice.actions;

export default reportOnoffSlice.reducer;

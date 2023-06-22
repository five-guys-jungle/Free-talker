// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Correction {
    original: string;
    correction: string;
}

export interface correctionState {
    corrections: Correction[];
}

export const initialState: correctionState = {
    corrections: [],
};

export const correctionSlice = createSlice({
    name: "correction",
    initialState,
    reducers: {
        appendCorrection: (state, action: PayloadAction<Correction>) => {
            state.corrections.push({
                original: action.payload.original,
                correction: action.payload.correction,
            });
        },
        clearCorrections: (state) => {
            state.corrections = [];
        },
    },
});

export const { appendCorrection, clearCorrections } = correctionSlice.actions;

export default correctionSlice.reducer;

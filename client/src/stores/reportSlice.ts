// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Correction {
    original: string;
    correction: string;
}


export interface Score {
    score: number;
}


export interface correctionState {
    corrections: Correction[];
}

export interface scoreState {
    score: number;
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

export const scoreSlice = createSlice({
    name: "score",
    initialState: { score: 0 },
    reducers: {
        setScore: (state, action: PayloadAction<Score>) => {
            state.score = action.payload.score;
        },
    },
});

export const { setScore } = scoreSlice.actions;

export const { appendCorrection, clearCorrections } = correctionSlice.actions;

export default correctionSlice.reducer;

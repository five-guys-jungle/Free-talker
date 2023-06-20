// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Sentence {
    _id: string;
    sentence: string;
}

export interface SentenceBoxState {
    sentences: Sentence[];
}

export const initialState: SentenceBoxState = {
    sentences: [],
};

export const sentenceBoxSlice = createSlice({
    name: "sentenceBox",
    initialState,
    reducers: {
        appendSentence: (state, action: PayloadAction<Sentence>) => {
            state.sentences.push({
                _id: action.payload._id,
                sentence: action.payload.sentence,
            });
        },
        clearSentences: (state) => {
            state.sentences = [];
        },
    },
});

export const { appendSentence, clearSentences } = sentenceBoxSlice.actions;

export default sentenceBoxSlice.reducer;

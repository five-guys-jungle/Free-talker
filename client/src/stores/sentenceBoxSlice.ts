// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Sentence {
    _id: string;
    sentence: string;
}

export interface SentenceBoxState {
    sentences: Sentence[];
    canRequestRecommend: boolean;
}

export const initialState: SentenceBoxState = {
    sentences: [],
    canRequestRecommend: false,
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
        setCanRequestRecommend: (state, action: PayloadAction<boolean>) => {
            state.canRequestRecommend = action.payload;
        }
    },
});

export const { appendSentence, clearSentences, setCanRequestRecommend } = sentenceBoxSlice.actions;

export default sentenceBoxSlice.reducer;

// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Sentence {
    _id: number;
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
            let prefix = "";
            switch(action.payload._id) {
                case 0:
                    prefix = "긍정😄 : ";
                    break;
                case 1:
                    prefix = "중립😐 : ";
                    break;
                case 2:
                    prefix = "부정🙁 : ";
                    break;
                default:
                    prefix = "";
            }
            state.sentences.push(
                {
                _id: action.payload._id,
                sentence: prefix + action.payload.sentence,
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

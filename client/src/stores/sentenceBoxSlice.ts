// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Sentence {
    _id: number;
    sentence: string;
    audioUrl?: string;
    isTTSLoading?: boolean;
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
            switch (action.payload._id) {
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
            if (action.payload._id === 3) {
                state.sentences.push(
                    {
                        _id: action.payload._id,
                        sentence: prefix + action.payload.sentence,
                        audioUrl: "",
                        isTTSLoading: true,
                    });

            } else {
                state.sentences.push(
                    {
                        _id: action.payload._id,
                        sentence: prefix + action.payload.sentence,
                        audioUrl: action.payload.audioUrl,
                        isTTSLoading: false,
                    });
            }
        },
        clearSentences: (state) => {
            state.sentences = [];
        },
        setCanRequestRecommend: (state, action: PayloadAction<boolean>) => {
            state.canRequestRecommend = action.payload;
        },
        updateAudioUrl: (state, action: PayloadAction<{ index: number, audioUrl: string }>) => {
            const { index, audioUrl } = action.payload;
            if (state.sentences[index]) {
                state.sentences[index].audioUrl = audioUrl;
            }
        },
        updateTTSLoading: (state, action: PayloadAction<{ index: number, isTTSLoading: boolean }>) => {
            const { index, isTTSLoading } = action.payload;
            if (state.sentences[index]) {
                state.sentences[index].isTTSLoading = isTTSLoading;
            }
        }
    },
});

export const { appendSentence, clearSentences, setCanRequestRecommend, updateAudioUrl, updateTTSLoading } = sentenceBoxSlice.actions;

export default sentenceBoxSlice.reducer;

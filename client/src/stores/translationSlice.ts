import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TalkBoxState {
    translataion: string;
}

export const initialState: TalkBoxState = {
    translataion: "번역 중입니다......",
};

export const translationBoxSlice = createSlice({
    name: "translationBox",
    initialState,
    reducers: {
        setText: (state, action: PayloadAction<string>) => {
            state.translataion = action.payload;
        },
    },
});

export const { setText } = translationBoxSlice.actions;

export default translationBoxSlice.reducer;

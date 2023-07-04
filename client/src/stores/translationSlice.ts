import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TalkBoxState {
    translataion: string;
    isVisible: boolean;
}

export const initialState: TalkBoxState = {
    translataion: "번역 중입니다......",
    isVisible: false,
};

export const translationBoxSlice = createSlice({
    name: "translationBox",
    initialState,
    reducers: {
        setText: (state, action: PayloadAction<string>) => {
            state.translataion = action.payload;
        },
        setVisible: (state, action: PayloadAction<boolean>) => { // 추가한 리듀서
            state.isVisible = action.payload;
        },
    },
});

export const { setText, setVisible } = translationBoxSlice.actions;

export default translationBoxSlice.reducer;

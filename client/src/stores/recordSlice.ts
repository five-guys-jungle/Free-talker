import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RecordState {
    record: boolean;
    message: string;
    messageColor: string; // 추가된 속성
}

export const initialState: RecordState = {
    record: true,
    message: "D키를 눌러 녹음을 시작하세요",
    messageColor: "black", // 초기 색상
};

export const recordSlice = createSlice({
    name: "record",
    initialState,
    reducers: {
        setRecord: (state, action: PayloadAction<boolean>) => {
            state.record = action.payload;
        },
        setMessage: (state, action: PayloadAction<string>) => {
            // 추가된 액션
            state.message = action.payload;
        },
        setMessageColor: (state, action: PayloadAction<string>) => {
            // 추가된 액션
            state.messageColor = action.payload;
        },
    },
});

export const { setRecord, setMessage, setMessageColor } = recordSlice.actions;

export default recordSlice.reducer;

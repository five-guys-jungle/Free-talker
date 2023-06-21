import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RecordState {
    record: boolean;
    message: string;
}

export const initialState: RecordState = {
    record: true,
    message: "R키를 눌러 녹음을 시작하세요",
};

export const recordSlice = createSlice({
    name: "record",
    initialState,
    reducers: {
        setRecord: (state, action: PayloadAction<boolean>) => {
            state.record = action.payload;
        },
        setMessage: (state, action: PayloadAction<string>) => { // 추가된 액션
            state.message = action.payload;
        },
    },
});

export const { setRecord, setMessage } = recordSlice.actions;

export default recordSlice.reducer;
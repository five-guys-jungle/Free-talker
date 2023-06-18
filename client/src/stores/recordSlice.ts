import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RecordState {
    record: boolean;
}

export const initialState: RecordState = {
    record: true,
};

export const recordSlice = createSlice({
    name: "record",
    initialState,
    reducers: {
        setRecord: (state, action: PayloadAction<boolean>) => {
            state.record = action.payload;
        }
    },
});

export const { setRecord } = recordSlice.actions;

export default recordSlice.reducer;
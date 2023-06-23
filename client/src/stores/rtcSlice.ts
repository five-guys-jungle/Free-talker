import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RtcState {
    callEnded: boolean;
}

export const initialState: RtcState = {
    callEnded: false,
};

export const callSlice = createSlice({
    name: "rtc",
    initialState,
    reducers: {
        setRtcEnded: (state, action: PayloadAction<boolean>) => {
            state.callEnded = action.payload;
        },
    },
});

export const { setRtcEnded } = callSlice.actions;

export default callSlice.reducer;

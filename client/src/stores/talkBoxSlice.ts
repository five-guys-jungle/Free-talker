// talkBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  name: string;
  img: string;
  side: string;
  text: string;
}

export interface TalkBoxState {
    messages: Message[];
}

export const initialState: TalkBoxState = {
    messages: [],
};

export const talkBoxSlice = createSlice({
    name: "talkBox",
    initialState,
    reducers: {
        appendMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
});

export const { appendMessage, clearMessages } = talkBoxSlice.actions;

export default talkBoxSlice.reducer;

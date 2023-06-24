// talkBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Character {
  name: string;
  img: string;
}

export interface UserBoxState {
    characters: Character[];
}

export const initialState: UserBoxState = {
    characters: [],
};

export const userboxSlice = createSlice({
    name: "userBox",
    initialState,
    reducers: {
        appendcharacters: (state, action: PayloadAction<Character>) => {
            state.characters.push(action.payload);
        },
        clearcharacters: (state) => {
            state.characters = [];
        }
    },
});

export const { appendcharacters, clearcharacters } = userboxSlice.actions;

export default userboxSlice.reducer;

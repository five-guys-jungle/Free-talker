// talkBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Character {
  name: string;
  img: string;
}

// Add playerNickname and playerTexture to UserBoxState
export interface UserBoxState {
  characters: Character[];
  otherNickname: string;
  otherTexture: string;
}

// Add playerNickname and playerTexture to initialState
export const initialState: UserBoxState = {
  characters: [],
  otherNickname: "",
  otherTexture: "",
};

export const userboxSlice = createSlice({
  name: "userBox",
  initialState,
  reducers: {
    appendcharacters: (state, action: PayloadAction<Character>) => {
      state.characters.push(action.payload);
    },
    clearcharacters: (state) => {
      state.otherTexture = "";
      state.otherNickname = "";
    },
    // Add setUserCharacter action
    setUserCharacter: (state, action: PayloadAction<{playerNickname: string, playerTexture: string}>) => {
      state.otherNickname = action.payload.playerNickname;
      state.otherTexture = action.payload.playerTexture;
    }
  },
});

export const { appendcharacters, clearcharacters, setUserCharacter } = userboxSlice.actions;

export default userboxSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Score {
  score: number;
}

export interface scoreState {
  score: number;
}



export const scoreSlice = createSlice({
  name: "score",
  initialState: { score: 0 },
  reducers: {
      setScore: (state, action: PayloadAction<Score>) => {
          state.score = action.payload.score;
      }
  },
});

export const { setScore } = scoreSlice.actions;

export default scoreSlice.reducer;
// guiderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isClicked: false,
  backgroundOpacity: 1,
};

const guiderSlice = createSlice({
  name: 'guider',
  initialState,
  reducers: {
    toggleIsClicked: state => {
      state.isClicked = !state.isClicked;
      state.backgroundOpacity = state.isClicked ? 0.5 : 1; // Toggle the background opacity when the modal opens/closes
    },
    setBackgroundOpacity: (state, action) => {
      state.backgroundOpacity = action.payload; // Action to set the background opacity
    },
  },
});

export const { toggleIsClicked, setBackgroundOpacity } = guiderSlice.actions;

export default guiderSlice.reducer;
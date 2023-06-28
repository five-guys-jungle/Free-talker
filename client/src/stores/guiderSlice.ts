// guiderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isClicked: false,
};

const guiderSlice = createSlice({
  name: 'guider',
  initialState,
  reducers: {
    toggleIsClicked: state => {
      state.isClicked = !state.isClicked;
    },
  },
});

export const { toggleIsClicked } = guiderSlice.actions;

export default guiderSlice.reducer;

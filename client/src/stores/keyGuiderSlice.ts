import { createSlice } from '@reduxjs/toolkit';

interface KeyGuiderState {
  isClicked: boolean;
  backgroundOpacity: number,
}

const initialState: KeyGuiderState = {
  isClicked: false,
  backgroundOpacity: 1,
};

export const keyGuiderSlice = createSlice({
  name: 'keyGuider',
  initialState,
  reducers: {
    toggleIsClicked: state => {
      state.isClicked = !state.isClicked;
      state.backgroundOpacity = state.isClicked ? 0.5 : 1;
    },
  },
});

export const { toggleIsClicked } = keyGuiderSlice.actions;


export default keyGuiderSlice.reducer;
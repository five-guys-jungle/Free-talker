// levelSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  level: 'Intermediate',
};

const levelSlice = createSlice({
  name: 'level',
  initialState,
  reducers: {
    changeLevel: (state) => {
      switch (state.level) {
        case 'Beginner':
          state.level = 'Intermediate';
          break;
        case 'Intermediate':
          state.level = 'Advanced';
          break;
        case 'Advanced':
          state.level = 'Beginner';
          break;
        default:
          state.level = 'Intermediate';
      }

      // Create and dispatch the custom event here, after the state has been updated
      const event = new CustomEvent('levelChanged', { detail: state.level });
      window.dispatchEvent(event);
    },
  },
});

export const { changeLevel } = levelSlice.actions;

export default levelSlice.reducer;
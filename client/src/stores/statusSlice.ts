import { createSlice } from '@reduxjs/toolkit';

const GAME_STATUS = { 
    login: "login",
    airport: "airport",
};

export interface ModeState {
    status: string;
  }

  const initialState: ModeState = {
    status: GAME_STATUS.login,
  };

export const modeSlice = createSlice({
    name: 'mode',
    initialState,
    reducers: {
        openAirport: (state) => {
            state.status = GAME_STATUS.airport;
        }
        ,
    },
});

export const {
    openAirport,
} = modeSlice.actions;

export default modeSlice.reducer;
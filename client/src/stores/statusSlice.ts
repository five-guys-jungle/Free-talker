import { createSlice } from '@reduxjs/toolkit';

const GAME_STATUS = { 
    login: "login",
    airport: "airport",
    dialog: "dialog",
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
        openDialog: (state) => {
            state.status = GAME_STATUS.dialog;
            console.log("openDialog");
        }
        
    },
});

export const {
    openAirport,
} = modeSlice.actions;

export default modeSlice.reducer;
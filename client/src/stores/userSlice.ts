import { createSlice, PayloadAction } from '@reduxjs/toolkit';



export const userSlice = createSlice({
    name: 'user',
    initialState: {
        playerId: "",
        playerTexture: "char0",
        playerNickname: "Unknown",
        userLoginId: "",
    },
    reducers: {
        setPlayerId: (state, action: PayloadAction<string>) => {
            state.playerId = action.payload;
        }
        ,
        setPlayerTexture: (state, action: PayloadAction<string>) => {
            state.playerTexture = action.payload;
        }
        ,
        setPlayerNickname: (state, action: PayloadAction<string>) => {
            state.playerNickname = action.payload;
        }
        ,
        setUserLoginId: (state, action: PayloadAction<string>) => {
            state.userLoginId = action.payload;
        }
        ,
    },
});

export const { setPlayerId, setPlayerTexture, setPlayerNickname, setUserLoginId } = userSlice.actions;


export const selectPlayerId = (state: any) => state.user.playerId;
export const selectPlayerTexture = (state: any) => state.user.playerTexture;
export const selectPlayerNickname = (state: any) => state.user.playerNickname;
export default userSlice.reducer;

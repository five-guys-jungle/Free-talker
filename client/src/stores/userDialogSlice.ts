// sentenceBoxSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface userDialog {
  situation: string;
  role: string;
  recommendations: string;
}

export interface Situation {
  situation : string;
}

export interface Role {
  role: string;
}

export interface Recommendation {
  _id: string;
  recommendation: string;
}


export interface UserDialogState {
    situation: string;
    role: string;
    recommendations: Recommendation[];
}

export const initialState: UserDialogState = {
    situation: "",
    role: "",
    recommendations: [],
};

export const userDialogSlice = createSlice({
    name: "userDialog",
    initialState,
    reducers: {
        setSituation: (state, action: PayloadAction<Situation>) => {
            state.situation = action.payload.situation;
        },
        clearSituation: (state) => {
            state.situation = "";
        },
        setRole: (state, action: PayloadAction<Role>) => {
            state.role = action.payload.role;
        },
        clearRole: (state) => {
            state.role = "";
        },
        appendRecommendation: (state, action: PayloadAction<Recommendation>) => {
            state.recommendations.push({
                _id: action.payload._id,
                recommendation: action.payload.recommendation,
            });
        },
        clearRecommendations: (state) => {
            state.recommendations = [];
        }
    },
});


export const { setSituation, clearSituation, setRole, clearRole, appendRecommendation, clearRecommendations } = userDialogSlice.actions;

export default userDialogSlice.reducer;

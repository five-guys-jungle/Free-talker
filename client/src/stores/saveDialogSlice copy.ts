import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export interface Dialog {
    userId: string;
    timestamp: string;
    nickname: string;
    npc: string;
    userTexture: string;
    score: number;
    corrections: Correction[];
    messages: Message[];
}

export interface Message {
    name: string;
    img: string;
    side: string;
    text: string;
}

export interface dialogState{
    dialogs: Dialog[];
}

export const initialState: dialogState = {
    dialogs: [],
};

export interface Correction {
    original: string;
    correction: string;
}

export interface correctionState {
    corrections: Correction[];
}

let DB_URL: string = process.env.REACT_APP_SERVER_URL!;

export const saveDialogSlice = createSlice({
    name: "savedialog",
    initialState,
    reducers: {
        saveDialog: (state, action: PayloadAction<Dialog>) => {
            console.log("save!!!!!!!")
            const dialog = action.payload;
            const userId= dialog.userId;
            const timestamp= dialog.timestamp;
            const nickname= dialog.nickname;
            const npc= dialog.npc;
            const userTexture= dialog.userTexture;
            const score= dialog.score;
            const corrections= dialog.corrections;
            const messages= dialog.messages;

            const body = {
                userId: userId,
                timestamp: timestamp,
                nickname: nickname,
                npc: npc,
                userTexture:userTexture,
                score:score,
                corrections:corrections,
                messages:messages,
            };

            try{
                console.log("try");
                const response = axios.post(`${DB_URL}/save/saveDialog`, body);
            }
            catch(e){
                console.log("!!! save error");
            }
            // async(e: React.FormEvent<HTMLFormElement>) => {
                
            //     const body = {
            //         userId: userId,
            //         timestamp: timestamp,
            //         nickname: nickname,
            //         npc: npc,
            //         userTexture:userTexture,
            //         score:score,
            //         corrections:corrections,
            //         messages:messages,
            //     };

            //     try{
            //         console.log("try");
            //         const response = await axios.post(`${DB_URL}/save/saveDialog`, body);
            //     }
            //     catch(e){
            //         console.log("!!! save error");
            //     }

            // }



        },
        deleteDialog: (state, action: PayloadAction<Dialog>)  => {
            const dialog = action.payload;
            const userId= dialog.userId;
            const timestamp= dialog.timestamp;

            const body = {
                userId: userId,
                timestamp: timestamp
            };

            try{
                console.log("try");
                const response = axios.post(`${DB_URL}/save/deleteDialog`, body);
            }
            catch(e){
                console.log("!!! delete error");
            }
            // async(e: React.FormEvent<HTMLFormElement>) => {
                
            //     const body = {
            //         userId: userId,
            //         timestamp: timestamp
            //     };

            //     try{
            //         console.log("try");
            //         const response = await axios.post(`${DB_URL}/save/deleteDialog`, body);
            //     }
            //     catch(e){
            //         console.log("!!! delete error");
            //     }
            // }
        }
    },
});

export const { saveDialog, deleteDialog } = saveDialogSlice.actions;

export default saveDialogSlice.reducer;

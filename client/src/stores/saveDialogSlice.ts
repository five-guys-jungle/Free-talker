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


export const saveDialog = async (state: Dialog) => {
        
        const body = {
            userId: state.userId,
            timestamp: state.timestamp,
            nickname: state.nickname,
            npc: state.npc,
            userTexture: state.userTexture,
            score: state.score,
            corrections: state.corrections,
            messages: state.messages,
        };

        try{
            console.log("try");
            const response = await axios.post(`${DB_URL}/save/saveDialog`, body);
        }
        catch(e){
            console.log("!!! save error");
        }

}



export const deleteDialog =async(state: Dialog)=> {
        
        const body = {
            userId: state.userId,
            timestamp: state.timestamp
        };

        try{
            console.log("try");
            const response = await axios.post(`${DB_URL}/save/deleteDialog`, body);
        }
        catch(e){
            console.log("!!! delete error");
        }
}

export const loadDialog =async(state: Dialog)=> {
        
    const body = {
        userId: state.userId
    };

    try{
        console.log("try");
        const response = await axios.post(`${DB_URL}/save/loadDialog`, body);
        // console.log(response.data.existingDialogs)

        return (response.data.existingDialogs)
    }
    catch(e){
        console.log("!!! delete error");
    }
}


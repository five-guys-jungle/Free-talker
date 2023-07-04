import axios, { AxiosError } from "axios";
import { Message, appendMessage, clearMessages } from "./talkBoxSlice";
import store from "../stores/index";

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


export interface dialogState {
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

    try {
        console.log("save dialog");

        const response = await axios.post(`${DB_URL}/save/saveDialog`, body);
        store.dispatch(clearMessages());
    } catch (e) {
        console.log("!!! save error");
    }
};

export const deleteDialog = async (state: Dialog) => {
    const body = {
        userId: state.userId,
        timestamp: state.timestamp,
    };

    try {
        console.log("try");
        const response = await axios.post(`${DB_URL}/save/deleteDialog`, body);
        store.dispatch(clearMessages());
    } catch (e) {
        console.log("!!! delete error");
    }
};

export const loadDialog = async (state: Dialog) => {
    const body = {
        userId: state.userId,
    };

    try {
        const response = await axios.post(`${DB_URL}/save/loadDialog`, body);

        let existingDialogs = response.data.existingDialogs;
        existingDialogs.sort((dialogA: any, dialogB: any) => {
            const convertTimestamp = (timestamp: string) => {
                const year = new Date().getFullYear(); // Assume current year
                const [month, day, partOfDay, time] = timestamp.split(" ");
                const monthNumber =
                    new Date(Date.parse(month + " 1, 2012")).getMonth() + 1; // Convert month name to number
                const [hour, minute, second] = time.split(":");
                const convertedHour =
                    partOfDay === "오후" && +hour !== 12 ? +hour + 12 :
                        +hour === 12 ? 0 : +hour; // Convert to 24-hour format

                return `${year}-${monthNumber}-${day} ${convertedHour}:${minute}:${second}`;
            };

            const convertedTimestampA = convertTimestamp(dialogA.timestamp);
            const convertedTimestampB = convertTimestamp(dialogB.timestamp);
            const timestampA = Date.parse(convertedTimestampA);
            const timestampB = Date.parse(convertedTimestampB);


            if (timestampA > timestampB) {
                return -1;
            } else if (timestampA < timestampB) {
                return 1;
            } else {
                return 0;
            }
        });
        // console.log(existingDialogs)
        return existingDialogs;
    } catch (e) {
        console.log("load dialog error");
    }
};

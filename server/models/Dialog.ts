import { Schema, model, Document, Model } from "mongoose";

export interface DialogInfo {
    userId: string
    timestamp: string,
    nickname: string,
    npc: string,
    userTexture: string,
    score: number,
    corrections: string,
    messages: string,
}

const dialog: Schema = new Schema<DialogInfo>({

    userId: { type: String, required: true},
    timestamp: { type: String, required: true},
    nickname:{ type: String, required: true},
    npc: { type: String, required: true},
    userTexture: { type: String, required: true},
    score: { type: Number, required: true},
    corrections: { type: String, required: true},
    messages: { type: String, required: true},

});

export const Dialog = model<DialogInfo>("dialog", dialog); // user 스키마를 이용해 user 모델 정의

export interface DialogDocument extends DialogInfo, Document {} // user 모델의 인터페이스 정의
// export interface IUserModel extends Model<IUserDocument> {}
export interface Dialog {
    userId: string;
    timestamp: number;
    nickname: string;
    npc: string;
    userTexture: string;
    score: number;
    corrections: Correction[];
    messages: Message[];
}

export interface Message {
    playerId: string;
    name: string;
    img: string;
    side: string;
    text: string;
}

export interface Correction {
    original: string;
    correction: string;
}


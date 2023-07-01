import { Schema, model, Document, Model } from "mongoose";

export interface IUserInfo {
    userId: string;
    userPw: string;
    userNickname: string;
    userTexture?: string;
    accessToken?: string;
}

const user: Schema = new Schema<IUserInfo>({
    // user 스키마 정의
    userId: { type: String, required: true, unique: true },
    userPw: { type: String, required: true },
    userNickname: { type: String, required: true, unique: true },
    userTexture: { type: String, default: "char0" },
    accessToken: { type: String },
});

export const User = model<IUserInfo>("user", user); // user 스키마를 이용해 user 모델 정의

export interface IUserDocument extends IUserInfo, Document {} // user 모델의 인터페이스 정의
// export interface IUserModel extends Model<IUserDocument> {}

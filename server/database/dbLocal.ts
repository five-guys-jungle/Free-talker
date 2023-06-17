import fs from "fs";
import mongoose from "mongoose";
import { User } from "../models/User";
import { connect } from "http2";
import "dotenv/config";

const dbHost = process.env.DB_HOST;

export async function connectDBLocal() {
    mongoose.set("strictQuery", false);
    try {
        if (typeof dbHost === "string") {
            await mongoose.connect(dbHost);
            console.log("MongoDB에 연결되었습니다.");
            await createCollection("user"); // 컬렉션 생성 함수 호출
        } else {
            throw new Error("DB_HOST is not defined");
        }
    } catch (error) {
        console.error("MongoDB 연결에 실패했습니다:", error);
    }
}

async function createCollection(modelName: string) {
    if (mongoose.modelNames().includes(modelName)) {
        return mongoose.model(modelName);
    }

    switch (modelName) {
        case "user":
            new User();
            break;
    }
}
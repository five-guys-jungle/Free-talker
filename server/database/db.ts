import fs from "fs";
import { config } from "../envconfig";
import mongoose from "mongoose";
import { User } from "../models/User";
import { connect } from "http2";

export async function connectDB() {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(config.db.DB_HOST);
        console.log("MongoDB에 연결되었습니다.");

        await createCollection("user"); // 컬렉션 생성 함수 호출
    } catch (error) {
        console.error("MongoDB 연결에 실패했습니다:", error);
    }
}

async function createCollection(modelName: string) {
    if (mongoose.modelNames().includes(modelName)) {
        console.log(`이미 존재하는 모델입니다: ${modelName}`);
        return mongoose.model(modelName);
    }

    switch (modelName) {
        case "user":
            new User();
            break;
    }
}

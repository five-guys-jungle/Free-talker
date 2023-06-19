import fs from "fs";
import mongoose from "mongoose";
import { User } from "../models/User";
import { connect } from "http2";
import "dotenv/config";

import {
    DynamoDBClient,
    CreateTableCommand,
    ListTablesCommand,
} from "@aws-sdk/client-dynamodb";

// import { User } from "../models/User";
import "dotenv/config";

const tableName = process.env.DYNAMODB_TABLE_NAME;
const client = new DynamoDBClient({ region: "ap-northeast-2" });

export async function connectDB() {
    try {
        if (typeof tableName === "string") {
            await createTable(tableName); // 테이블 생성 함수 호출
            console.log("DynamoDB에 연결되었습니다.");
        } else {
            throw new Error("DYNAMODB_TABLE_NAME is not defined");
        }
    } catch (error) {
        console.error("DynamoDB 연결에 실패했습니다:", error);
    }
}

async function createTable(tableName: string) {
    try {
        const tableExists = await doesTableExist(tableName);
        console.log(`Table Exists: ${tableExists}`);
        if (!tableExists) {
            await createTableIfNotExists(tableName);
        } else {
            console.log(`${tableName} 테이블이 이미 존재합니다.`);
        }
    } catch (error) {
        console.error("테이블 생성에 실패했습니다:", error);
    }
}

async function doesTableExist(tableName: string) {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log("List Tables : ", response);
    return response.TableNames?.includes(tableName);
}

async function createTableIfNotExists(tableName: string) {
    const params = {
        TableName: tableName,
        AttributeDefinitions: [
            {
                AttributeName: "userId",
                AttributeType: "S",
            },
            {
                AttributeName: "userNickname",
                AttributeType: "S",
            },
        ],
        KeySchema: [
            {
                AttributeName: "userId",
                KeyType: "HASH",
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: "userNickname-index",
                KeySchema: [
                    {
                        AttributeName: "userNickname",
                        KeyType: "HASH",
                    },
                ],
                Projection: {
                    ProjectionType: "ALL",
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1,
                    WriteCapacityUnits: 1,
                },
            },
        ],
    };
    const command = new CreateTableCommand(params);
    const response = await client.send(command);
    console.log(`테이블 ${tableName}이 생성되었습니다.`);
}

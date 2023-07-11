import fs from "fs";
import mongoose from "mongoose";
import { User } from "../models/User";
import { connect } from "http2";
import "dotenv/config";

import {
    DynamoDBClient,
    CreateTableCommand,
    ListTablesCommand,
    UpdateItemCommand,
    UpdateTableCommand,
    ScanCommand,
} from "@aws-sdk/client-dynamodb";

const tableName = process.env.DYNAMODB_TABLE_NAME;
const client = new DynamoDBClient({ region: "ap-northeast-2" });

export async function connectDB() {
    try {
        if (typeof tableName === "string") {
            await createTable(tableName); // 테이블 생성 함수 호출
            // const response = updateTableThroughput(tableName);
            // console.log(response);
            // await createTable("dialogs");
            await createReportTable("dialogs");
            console.log("DynamoDB에 연결되었습니다.");

            // // DB 연결 후 모든 유저의 토큰을 초기화합니다.
            // await resetAllTokens();

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
        // console.log(`Table Exists: ${tableExists}`);
        if (!tableExists) {
            await createTableIfNotExists(tableName);
        } else {
            console.log(`${tableName} 테이블이 이미 존재합니다.`);
            // updateTableThroughput(tableName);
        }
    } catch (error) {
        console.error("테이블 생성에 실패했습니다:", error);
    }
}

async function doesTableExist(tableName: string) {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    // console.log("List Tables : ", response);
    return response.TableNames?.includes(tableName);


}

async function createReportTable(tableName: string = "dialogs") {
    try {
        const tableExists = await doesTableExist(tableName);
        // console.log(`Table Exists: ${tableExists}`);
        if (!tableExists) {
            await createReportTableIfNotExists(tableName);
        } else {
            console.log(`${tableName} 테이블이 이미 존재합니다.`);
        }
    } catch (error) {
        console.error("테이블 생성에 실패했습니다:", error);
    }
}

async function createReportTableIfNotExists(tableName: string = "dialogs") {
    const params = {
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' }, // String data type
            { AttributeName: 'timestamp', AttributeType: 'S' }, // String data type
        ],
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
            { AttributeName: 'timestamp', KeyType: 'RANGE' } // Sort key
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5, // Adjust the read capacity units as per your requirements
            WriteCapacityUnits: 5 // Adjust the write capacity units as per your requirements
        }
    };
    const command = new CreateTableCommand(params);
    const response = await client.send(command);
    console.log(`테이블 ${tableName}이 생성되었습니다.`);
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

async function updateTableThroughput(tableName: string) {
    const params = {
        TableName: tableName,
        ProvisionedThroughput: {
            ReadCapacityUnits: 20, // 증가시킬 읽기 처리량
            WriteCapacityUnits: 50 // 증가시킬 쓰기 처리량
        }
    };

    const command = new UpdateTableCommand(params);
    const response = await client.send(command);
    console.log(`테이블 ${tableName}의 처리량이 업데이트되었습니다.`);
}

async function resetAllTokens() {
    try {
        // DynamoDB에서 모든 사용자를 가져옵니다.
        const scanCommand = new ScanCommand({
            TableName: tableName,
        });
        const data = await client.send(scanCommand);

        // 'data.Items'가 'undefined'인 경우, 빈 배열로 설정합니다.
        const items = data.Items || [];

        // 각 사용자의 엑세스 토큰을 초기화합니다.
        for (const item of items) {
            if (item.userId && item.userId.S) {
                const userId = item.userId.S; // 여기서 userId는 String 형태여야 합니다.

                const updateParams = {
                    ExpressionAttributeNames: {
                        "#JWT": "accessToken"
                    },
                    ExpressionAttributeValues: {
                        ":t": {
                            "S": ""
                        }
                    },
                    Key: {
                        userId: { S: userId }
                    },
                    TableName: tableName,
                    UpdateExpression: "SET #JWT = :t"
                };

                const response = await client.send(new UpdateItemCommand(updateParams));
                console.log(`Reset token for userId ${userId}`);
            }
        }
    } catch (err) {
        console.log(err);
    }
}
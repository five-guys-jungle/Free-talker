import AWS from "aws-sdk";
import { User } from "../models/User";
import "dotenv/config";

const tableName = process.env.DYNAMODB_TABLE_NAME;

const aws_key = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

AWS.config.update(aws_key);
// const dynamoDBClient = new AWS.DynamoDB.DocumentClient();

const dynamoDB = new AWS.DynamoDB();

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
        if (!tableExists) {
            await createTableIfNotExists(tableName);
        }
    } catch (error) {
        console.error("테이블 생성에 실패했습니다:", error);
    }
}

async function doesTableExist(tableName: string) {
    const response = await dynamoDB.listTables().promise();
    return response.TableNames?.includes(tableName);
}

async function createTableIfNotExists(tableName: string) {
    const params: AWS.DynamoDB.CreateTableInput = {
        TableName: tableName,
        AttributeDefinitions: [
            {
                AttributeName: "userId",
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
    await dynamoDB.createTable(params).promise();
    console.log(`테이블 ${tableName}이 생성되었습니다.`);
}

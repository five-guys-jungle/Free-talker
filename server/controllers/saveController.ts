import { Request, Response } from "express";
import "dotenv/config";
import {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    QueryCommand,
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const tableName = process.env.DYNAMODB_TABLE_NAME;
const client = new DynamoDBClient({ region: "ap-northeast-2" });
// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space


export const saveDialog = async (req: Request, res: Response) => {
    try {
        const { userId, timestamp, nickname, npc,
        userTexture, score, corrections, messages } = req.body;

        const queryByUserId = {
            TableName: tableName,
            Key: {
                userId: { S: userId },
            },
        };
        const foundUserById = await client.send(
            new GetItemCommand(queryByUserId)
        );
        
        console.log("foundUserById : ", foundUserById);


        const item = foundUserById.Item;

        if(item){
            const existingDialogs = Object.keys(item).filter(key => key.startsWith('dialog'));
            const newDialogKey = `dialog${existingDialogs.length + 1}`;

            if (!existingDialogs.includes(newDialogKey)) {
                const putParams = {
                    TableName: tableName,
                    Item: {
                        userId: { S: userId },
                        data: {
                            ...item.data,
                            [newDialogKey]: { S: JSON.stringify({
                                timestamp,
                                nickname,
                                npc,
                                userTexture,
                                score,
                                corrections,
                                messages
                            })}
                        }
                    }
                };

                const putItem = new PutItemCommand(putParams);

                const data = await client.send(putItem);

                if (data !== undefined) {
                    console.log("Successfully create save report");
                    return res.json({
                        success: true,
                        message: "Successfully create save report",
                        status: 200, // 200: 성공
                    });
                }
            }
        } 
        else {
            console.log("User not found");
            return res.json({
                success: false,
                message: "User not found",
                status: 404, // 404: 찾을 수 없음
            });
        }

    } catch (err) {
        console.log(err);
    }
};


export const deleteDialog = async (req: Request, res: Response) => {
    try {
        const { userId, timestamp } = req.body;

        const deleteParams = {
            TableName: tableName,
            Key: {
                userId: { S: userId },
            },
            ConditionExpression: `attribute_exists(data.dialog${timestamp})`,
        };

        const deleteItem = new DeleteItemCommand(deleteParams);
        const data = await client.send(deleteItem);

        if (data !== undefined) {
            console.log("Successfully deleted dialog");
            return res.json({
                success: true,
                message: "Successfully deleted dialog",
                status: 200, // 200: 성공
            });
        }
    } catch (err) {
        console.log(err);
    }
};
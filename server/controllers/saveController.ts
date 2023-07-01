import { Request, Response } from "express";
import "dotenv/config";
import {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    QueryCommand,
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import { Dialog, DialogDocument, Message, Correction } from "../models/Dialog";

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const tableName = "dialogs";
const client = new DynamoDBClient({ region: "ap-northeast-2" });
// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

export const saveDialog = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            timestamp,
            nickname,
            npc,
            userTexture,
            score,
            corrections,
            messages,
        } = req.body;
        console.log(`messages: ${JSON.stringify(messages)}`);

        const item = {
            userId: { S: userId },
            timestamp: { S: timestamp },
            nickname: { S: nickname },
            npc: { S: npc },
            userTexture: { S: userTexture },
            score: { S: score.toString() },

            corrections:
                corrections === undefined
                    ? { L: [] }
                    : {
                        L: corrections.map(
                            ({ original, correction }: Correction) => ({
                                M: {
                                    original: { S: original },
                                    correction: { S: correction },
                                },
                            })
                        ),
                    },
            messages:
                messages === undefined
                    ? { L: [] }
                    : {
                        L: messages.map(
                            ({
                                playerId,
                                name,
                                img,
                                side,
                                text,
                                audioUrl
                            }: Message) => ({
                                M: {
                                    playerId: { S: playerId },
                                    name: { S: name },
                                    img: { S: img },
                                    side: { S: side },
                                    text: { S: text },
                                    audioUrl: { S: audioUrl },
                                },
                            })
                        ),
                    },
        };

        // console.log(JSON.stringify(item, null, 2));
        const putParams = {
            TableName: tableName,
            Item: item,
        };

        const putItem = new PutItemCommand(putParams);
        const data = await client.send(putItem);

        // console.log("saveDialog: code here");
        if (data !== undefined) {
            console.log("Successfully create save report");
            return res.json({
                success: true,
                message: "Successfully create save report",
                status: 200, // 200: 성공
            });
        } else {
            console.log("Dialogs not found");
            return res.json({
                success: false,
                message: "Dialogs not found",
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
                timestamp: { S: timestamp },
            },
            ReturnValues: "ALL_OLD",
        };

        const deleteItem = new DeleteItemCommand(deleteParams);
        console.log(deleteItem);

        // TODO : deleteItem에서 오디오 URL 받아서, S3 Audio 파일 지우기
        await client.send(deleteItem);

        console.log("Successfully deleted dialog");
        return res.json({
            success: true,
            message: "Successfully deleted saved report",
            status: 200, // 200: 성공
        });
    } catch (err) {
        console.log("Error deleting item ", err);
        return res.json({
            success: false,
            message: "Error deleting saved report",
            status: 500, // 500: 서버 오류
        });
    }
};
export const loadDialog = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;

        const queryByUserId = {
            TableName: tableName,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": { S: userId },
            },
        };

        const queryCommand = new QueryCommand(queryByUserId);
        const queryResult = await client.send(queryCommand);

        if (queryResult.Items) {
            const existingDialogs = queryResult.Items.map((item) =>
                unmarshall(item)
            );
            console.log(existingDialogs);
            return res.json({ existingDialogs });
        } else {
            const emptyArray: any = [];
            console.log("No dialogs found, Array: ", emptyArray);
            return res.json({ emptyArray });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred" });
    }
};

import { Request, Response } from "express";
import { IUserInfo, User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AWS from "aws-sdk";
// import { PutItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const aws_key = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

AWS.config.update(aws_key);

const tableName = "user";
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// const put: AWS.DynamoDB.DocumentClient.PutItemInput = {
//     TableName: tableName,
//     Item: {
//       userId: `${userId}`,
//       userPw: `${userPw}`,
//       userNickname: `${userNickname}`,
//     },
//   };

// const get: AWS.DynamoDB.DocumentClient.PutItemInput = {
//     TableName: tableName,
//     Item: {
//       userId: `${userId}`,
//       userPw: `${userPw}`,
//       userNickname: `${userNickname}`,
//     },
//   };

// const foundUser: IUserInfo | null = await User.findOne({
//     userId: userId,
// })

const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

async function hashPw(password: string): Promise<string> {
    const saltRounds = 10;

    const hashedPw = await new Promise<string>((resolve, reject) => {
        bcrypt.hash(
            password,
            saltRounds,
            (err: Error | undefined, hash: string) => {
                if (err) reject(err);
                resolve(hash);
            }
        );
    });
    return hashedPw;
}

export const signup = async (req: Request, res: Response) => {
    try {
        const { userId, userPw, userNickname } = req.body;

        // Data validation
        if (
            !userIdRegex.test(userId) ||
            !userNicknameRegex.test(userNickname)
        ) {
            return res.status(400).send("Invalid userId or userNickname");
        } else {
            const hashedPw = await hashPw(userPw);

            const putParams = {
                TableName: tableName,
                Item: {
                    userId: userId,
                    userPw: hashedPw,
                    userNickname: userNickname,
                },
            };
            await dynamoDB.put(putParams, (error, data) => {
                if (error) {
                    console.log("DynamoDB put error:", error);
                    return res.json({
                        success: false,
                        message: "Failed to create new user",
                        status: 500, // DB 오류
                    });
                } else {
                    console.log("Successfully create new user");
                    return res.json({
                        success: true,
                        message: "Successfully created new user",
                        status: 200, // 200: 성공
                    });
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
};

const jwtKey = process.env.DB_HOST;

export const login = async (req: Request, res: Response) => {
    try {
        const { userId, userPw } = req.body;

        const queryParams = {
            TableName: tableName,
            Key: {
                userId: userId,
            },
        };

        if (!userId || !userPw) {
            return res.status(400).send("Invalid userId or usePw");
        } else {
            await dynamoDB.get(queryParams, (error, data) => {
                if (error) {
                    console.log("DynamoDB get error:", error);
                    return res.json({
                        success: false,
                        message: "Failed to get user",
                        status: 500, // DB 오류
                    });
                } else {
                    // when found user
                    if (data.Item === undefined) {
                        console.log("User not found");
                        return res.json({
                            success: false,
                            message: "User not found",
                            status: 404, // 404: Not Found
                        });
                    } else {
                        const match = bcrypt.compareSync(
                            userPw,
                            data.Item.userPw
                        );
                        if (typeof jwtKey === "string" && match) {
                            const accessToken = jwt.sign(
                                {
                                    userId: data.Item.userId,
                                    userNickname: data.Item.userNickname,
                                    uuid: uuidv4(),
                                },
                                jwtKey,
                                {
                                    expiresIn: "1h",
                                }
                            );
                            console.log("accessToken:", accessToken);
                            return res.json({
                                status: 200,
                                message: "Login success",
                                data: accessToken,
                                userId: data.Item.userId,
                                userNickname: data.Item.userNickname,
                            });
                        } else {
                            console.log("Error : jwt is invalid!!");
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};

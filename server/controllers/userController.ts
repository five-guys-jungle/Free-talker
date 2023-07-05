import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt, { decode, sign, verify } from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import {
    GetItemCommand,
    PutItemCommand,
    UpdateItemCommand,
    QueryCommand,
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
// import { verify } from 'crypto';

const tableName = process.env.DYNAMODB_TABLE_NAME;
const client = new DynamoDBClient({ region: "ap-northeast-2" });
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
        if (!userIdRegex.test(userId) || (userId.length < 4 || userId.length > 20)) {
            return res.status(400).send("Invalid userId");
        } else if (!userNicknameRegex.test(userNickname) || (userNickname.length < 2 || userNickname.length > 12)) {
            return res.status(400).send("Invalid userNickname");
        } else if (userPw === "" || userPw === undefined || userPw === null || userPw.length < 4 || userPw.length > 20) {
            return res.status(400).send("Invalid userPw");
        } else {
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
            console.log(!!foundUserById.Item);
            if (!!foundUserById.Item) {
                // if exists
                return res
                    .status(409)
                    .json({ status: 409, message: "User ID already exists" });
            }

            const queryItemByUserNickname = {
                TableName: tableName,
                IndexName: "userNickname-index",
                KeyConditionExpression: "userNickname = :userNickname",
                ExpressionAttributeValues: {
                    ":userNickname": { S: userNickname },
                },
            };

            const foundUserByNickname = await client.send(
                new QueryCommand(queryItemByUserNickname)
            );
            // console.log("foundUserByNickname : ", foundUserByNickname);
            // console.log(foundUserByNickname.Items);

            if (
                foundUserByNickname.Items &&
                foundUserByNickname.Items.length > 0
            ) {
                return res.status(409).json({
                    status: 409,
                    message: "User Nickname already exists",
                });
            }

            const hashedPw = await hashPw(userPw);

            const putParams = {
                TableName: tableName,
                Item: {
                    userId: { S: userId },
                    userPw: { S: hashedPw },
                    userNickname: { S: userNickname },
                    accessToken: { S: "" }
                },
            };

            const putItem = new PutItemCommand(putParams);
            const data = await client.send(putItem);

            if (data !== undefined) {
                console.log("Successfully create new user");
                console.log("Signup data: ", data);
                return res.json({
                    success: true,
                    message: "Successfully created new user",
                    status: 200, // 200: 성공
                });
            } else {
                console.log("DynamoDB put error");
                return res.json({
                    success: false,
                    message: "Failed to create new user",
                    status: 500, // DB 오류
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
};

const jwtKey = process.env.JWT_SECRET_KEY;

export const login = async (req: Request, res: Response) => {
    try {
        const { userId, userPw } = req.body;

        if (!userId || !userPw) {
            return res.status(400).send("Invalid userId or usePw");
        } else {
            const queryByUserId = {
                TableName: tableName,
                Key: {
                    userId: { S: userId },
                },
            };
            const getItemByUserId = new GetItemCommand(queryByUserId);
            const foundUser = await client.send(getItemByUserId);

            // console.log("foundUser: ", foundUser);
            if (!foundUser.Item) {
                console.log("User not found");
                return res.json({
                    success: false,
                    message: "User not found",
                    status: 404, // DB 오류
                });
            } else {
                // when found user
                // console.log("login data: ", foundUser.Item);
                let accessToken;
                const userPwAttribute = foundUser.Item.userPw;
                const accessTokenAttribute = foundUser.Item.accessToken;
                if (typeof userPwAttribute === "undefined") {
                    console.log("User not found");
                    return res.json({
                        success: false,
                        message: "User not found",
                        status: 404, // 404: Not Found
                    });
                } else {
                    const match = bcrypt.compareSync(
                        userPw,
                        userPwAttribute?.S || ""
                    );
                    console.log(`accessTokenAtrribute.S: ${JSON.stringify(accessTokenAttribute)}`);
                    if (match) {
                        if (accessTokenAttribute.S !== undefined && typeof jwtKey === "string" && accessTokenAttribute.S !== "") {
                            try {
                                jwt.verify(accessTokenAttribute.S, jwtKey);
                                console.log("token verified. Already logged in");
                                return res.status(403).json({
                                    status: 403,
                                    success: false,
                                    message: "Already logged in",
                                });
                            } catch (error) {
                                // Token verification faild, likely because the token has expired
                                // Ignore and proceed to generate a new token
                                if (error instanceof jwt.TokenExpiredError) {
                                    console.log("Token expired, generate a new token");

                                    accessToken = sign(
                                        {
                                            userId: foundUser.Item.userId.S,
                                            userNickname: foundUser.Item.userNickname.S,
                                            uuid: uuidv4(),
                                        },
                                        jwtKey,
                                        {
                                            expiresIn: "2h",
                                        }
                                    );
                                } else {
                                    // jwt token error
                                    return res.json({
                                        status: 403,
                                        success: false,
                                        message: "Invalid token",
                                    });
                                }

                            }
                        } else {
                            if (typeof jwtKey === "string") {
                                // No token, proceed to generate a new one
                                // the code to generate a new token
                                accessToken = sign(
                                    {
                                        userId: foundUser.Item.userId.S,
                                        userNickname: foundUser.Item.userNickname.S,
                                        uuid: uuidv4(),
                                    },
                                    jwtKey,
                                    {
                                        expiresIn: "2h",
                                    }
                                );
                            }

                        }
                        console.log(`accessToken : ${accessToken}`);
                        if (accessToken !== undefined) {
                            const updateParams = {
                                ExpressionAttributeNames: {
                                    "#JWT": "accessToken"
                                },
                                ExpressionAttributeValues: {
                                    ":t": {
                                        S: accessToken,
                                    }
                                },
                                Key: {
                                    userId: { S: userId }
                                },
                                ReturnValues: "ALL_NEW",
                                TableName: tableName,
                                UpdateExpression: "SET #JWT = :t"
                            };

                            const response = await client.send(new UpdateItemCommand(updateParams));
                            console.log(`Login Success! response : ${JSON.stringify(response)}`);

                            return res.json({
                                status: 200,
                                success: true,
                                message: "Login success",
                                data: accessToken,
                                userId: foundUser.Item.userId.S,
                                userNickname: foundUser.Item.userNickname.S,
                            });
                        } else {
                            // jwt token error
                            return res.json({
                                status: 500,
                                success: false,
                                message: "Internal Server Error",
                            });
                        }
                    } else {
                        return res.json({
                            status: 400,
                            message: "Password is not correct",
                            success: false,
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        console.log("userId:", userId);

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
            ReturnValues: "ALL_NEW",
            TableName: tableName,
            UpdateExpression: "SET #JWT = :t"
        };

        const response = await client.send(new UpdateItemCommand(updateParams));
        // console.log(`Logout Success!! response: ${JSON.stringify(response)}`);
        // console.log(JSON.stringify(item, null, 2));

        return res.json({
            status: 200,
            success: true,
            message: "Logout success",
        })
    }
    catch (err) {
        console.log(err);
    }
}

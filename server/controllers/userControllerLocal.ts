import { Request, Response } from "express";
import { IUserInfo, User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { access } from "fs";

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

export const signupLocal = async (req: Request, res: Response) => {
    try {
        const { userId, userPw, userNickname } = req.body;

        if (
            !userIdRegex.test(userId) ||
            !userNicknameRegex.test(userNickname)
        ) {
            return res.status(400).send("Invalid userId or userNickname");
        } else {
            const foundUserById = await User.findOne({ userId: userId });
            if (foundUserById) {
                return res
                    .status(409)
                    .json({ status: 409, message: "userId already exists" });
            }
            const foundUserByNick = await User.findOne({
                userNickname: userNickname,
            });
            if (foundUserByNick) {
                return res.status(410).json({
                    status: 410,
                    message: "userNickname already exists",
                });
            }

            const hashedPw = await hashPw(userPw);
            const result = await User.collection.insertOne({
                userId: userId,
                userPw: hashedPw,
                userNickname: userNickname,
            });
            if (!result) {
                return res.json({
                    
                    success: false,
                    message: "Failed to create new user",
                });
            } else {
                const object = await User.findOne({ userId: userId });
                console.log("조회된 객체:", object);
                return res.json({
                    success: true,
                    message: "Successfully created new user",
                    status: 200 // 200: 성공
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
};

const jwtKey = process.env.DB_HOST;

export const loginLocal = async (req: Request, res: Response) => {
    try {
        const { userId, userPw } = req.body;

        if (!userId || !userPw) {
            return res.status(400).send("Invalid userId or userPw");
        } else {
            const foundUser: IUserInfo | null = await User.findOne({
                userId: userId,
            });
            if (!foundUser) {
                return res.status(404).send("User not found");
            } else {
                const match = await bcrypt.compare(userPw, foundUser.userPw);
                if (match) {
                    console.log("비밀번호 일치");

                    if (typeof jwtKey === "string") {
                        const accessToken = jwt.sign(
                            {
                                userId: foundUser.userId,
                                userNickname: foundUser.userNickname,
                                uuid: uuidv4(),
                            },
                            jwtKey,
                            {
                                expiresIn: "1h",
                            }
                        );
                            if (foundUser.accessToken) {
                                console.log("accessToken:", accessToken);
                                return res.status(401).send("Invalid accessToken");
                            }
                        // Update the user's accessToken
                        foundUser.accessToken = accessToken;
                        await User.findOneAndUpdate({ userId: userId }, { accessToken: accessToken }, { new: true });



                        console.log("accessToken:", accessToken);
                        return res.json({
                            status: 200,
                            message: "Login success",
                            data: accessToken,
                            userId: foundUser.userId,
                            userNickname: foundUser.userNickname,
                        });
                    } else {
                        console.log("Error : jwt is invalid!!");
                    }
                } else {
                    return res.status(401).send("Invalid password");
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};

export const logoutLocal = async (req: Request, res: Response) => {
    try {
        const { userNickname } = req.body;
        console.log("userNickname:", userNickname);
        const result = await User.findOneAndUpdate(
            { userNickname: userNickname },
            { accessToken: ""  },
            { new: true }
        );
    }
    catch (err) {
        console.log(err);
    }
};
        


// import { Request, Response } from "express";
// import { IUserInfo, User } from "../models/User";
// import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

// async function hashPw(password: string): Promise<string> {
//     const saltRounds = 10;

//     const hashedPw = await new Promise<string>((resolve, reject) => {
//         bcrypt.hash(
//             password,
//             saltRounds,
//             (err: Error | undefined, hash: string) => {
//                 if (err) reject(err);
//                 resolve(hash);
//             }
//         );
//     });
//     return hashedPw;
// }

// export const signupLocal = async (req: Request, res: Response) => {
//     try {
//         const { userId, userPw, userNickname } = req.body;

//         if (
//             !userIdRegex.test(userId) ||
//             !userNicknameRegex.test(userNickname)
//         ) {
//             return res.status(400).send("Invalid userId or userNickname");
//         } else {
//             const foundUserById = await User.findOne({ userId: userId });
//             if (foundUserById) {
//                 return res
//                     .status(409)
//                     .json({ status: 409, message: "userId already exists" });
//             }
//             const foundUserByNick = await User.findOne({
//                 userNickname: userNickname,
//             });
//             if (foundUserByNick) {
//                 return res.status(410).json({
//                     status: 410,
//                     message: "userNickname already exists",
//                 });
//             }

//             const hashedPw = await hashPw(userPw);
//             const result = await User.collection.insertOne({
//                 userId: userId,
//                 userPw: hashedPw,
//                 userNickname: userNickname,
//             });
//             if (!result) {
//                 return res.json({
                    
//                     success: false,
//                     message: "Failed to create new user",
//                 });
//             } else {
//                 const object = await User.findOne({ userId: userId });
//                 console.log("조회된 객체:", object);
//                 return res.json({
//                     success: true,
//                     message: "Successfully created new user",
//                     status: 200 // 200: 성공
//                 });
//             }
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// const jwtKey = process.env.DB_HOST;

// export const loginLocal = async (req: Request, res: Response) => {
//     try {
//         const { userId, userPw } = req.body;

//         if (!userId || !userPw) {
//             return res.status(400).send("Invalid userId or userPw");
//         } else {
//             const foundUser: IUserInfo | null = await User.findOne({
//                 userId: userId,
//             });
//             if (!foundUser) {
//                 return res.status(404).send("User not found");
//             } else {
//                 // when found User
//                 const match = await bcrypt.compare(userPw, foundUser.userPw);
//                 if (match) {
//                     console.log("비밀번호 일치");
//                 }
//                 if (typeof jwtKey === "string" && match) {
//                     const accessToken = jwt.sign(
//                         {
//                             userId: foundUser.userId,
//                             userNickname: foundUser.userNickname,
//                             uuid: uuidv4(),
//                         },
//                         jwtKey,
//                         {
//                             expiresIn: "1h",
//                         }
//                     );
//                     console.log("accessToken:", accessToken);
//                     return res.json({
//                         status: 200,
//                         message: "Login success",
//                         data: accessToken,
//                         userId: foundUser.userId,
//                         userNickname: foundUser.userNickname,
//                     });
//                 } else {
//                     console.log("Error : jwt is invalid!!");
//                 }
//             }
//         }
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send("Internal Server Error");
//     }
// };

// import { Request, Response } from "express";
// import { IUserInfo, User } from "../models/User";
// import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import AWS from "aws-sdk";
// import "dotenv/config";
// import {
//     GetItemCommand,
//     PutItemCommand,
//     DynamoDBClient,
// } from "@aws-sdk/client-dynamodb";

// const tableName = process.env.DYNAMODB_TABLE_NAME;
// const client = new DynamoDBClient({ region: "ap-northeast-2" });

// // const put: PutItemInput = {
// //     TableName: tableName,
// //     Item: {
// //       userId: `${userId}`,
// //       userPw: `${userPw}`,
// //       userNickname: `${userNickname}`,
// //     },
// //   };

// // const get: AWS.DynamoDB.DocumentClient.GutItemInput = {
// //     TableName: tableName,
// //     Item: {
// //       userId: `${userId}`,
// //       userPw: `${userPw}`,
// //       userNickname: `${userNickname}`,
// //     },
// //   };

// // const foundUser: IUserInfo | null = await User.findOne({
// //     userId: userId,
// // })

// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

// async function hashPw(password: string): Promise<string> {
//     const saltRounds = 10;

//     const hashedPw = await new Promise<string>((resolve, reject) => {
//         bcrypt.hash(
//             password,
//             saltRounds,
//             (err: Error | undefined, hash: string) => {
//                 if (err) reject(err);
//                 resolve(hash);
//             }
//         );
//     });
//     return hashedPw;
// }

// export const signup = async (req: Request, res: Response) => {
//     try {
//         const { userId, userPw, userNickname } = req.body;

//         // Data validation
//         if (
//             !userIdRegex.test(userId) ||
//             !userNicknameRegex.test(userNickname)
//         ) {
//             return res.status(400).send("Invalid userId or userNickname");
//         } else {
//             const hashedPw = await hashPw(userPw);

//             const putParams = {
//                 TableName: tableName,
//                 Item: {
//                     userId: { S: userId },
//                     userPw: { S: hashedPw },
//                     userNickname: { S: userNickname },
//                 },
//             };

//             const command = new PutItemCommand(putParams);
//             const data = await client.send(command);

//             if (data === undefined) {
//                 console.log("DynamoDB put error");
//                 return res.json({
//                     success: false,
//                     message: "Failed to create new user",
//                     status: 500, // DB 오류
//                 });
//             } else {
//                 console.log("Successfully create new user");
//                 console.log("Signup data: ", data);
//                 return res.json({
//                     success: true,
//                     message: "Successfully created new user",
//                     status: 200, // 200: 성공
//                 });
//             }
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// const jwtKey = process.env.JWT_SECRET_KEY;

// export const login = async (req: Request, res: Response) => {
//     try {
//         const { userId, userPw } = req.body;

//         const queryParams = {
//             TableName: tableName,
//             Key: {
//                 userId: { S: userId },
//             },
//         };

//         if (!userId || !userPw) {
//             return res.status(400).send("Invalid userId or usePw");
//         } else {
//             const command = new GetItemCommand(queryParams);
//             const foundUser = await client.send(command);

//             console.log("foundUser: ", foundUser);
//             if (!foundUser.Item) {
//                 console.log("User not found");
//                 return res.json({
//                     success: false,
//                     message: "User not found",
//                     status: 404, // DB 오류
//                 });
//             } else {
//                 // when found user
//                 console.log("login data: ", foundUser.Item);
//                 const userPwAttribute = foundUser.Item.userPw;
//                 if (typeof userPwAttribute === "undefined") {
//                     console.log("User not found");
//                     return res.json({
//                         success: false,
//                         message: "User not found",
//                         status: 404, // 404: Not Found
//                     });
//                 } else {
//                     const match = bcrypt.compareSync(
//                         userPw,
//                         userPwAttribute?.S || ""
//                     );
//                     console.log(`userPw : ${userPw}`);
//                     console.log(`userPwAttribute : ${userPwAttribute.S}`);
//                     if (typeof jwtKey === "string" && match) {
//                         const accessToken = jwt.sign(
//                             {
//                                 userId: foundUser.Item.userId.S,
//                                 userNickname: foundUser.Item.userNickname.S,
//                                 uuid: uuidv4(),
//                             },
//                             jwtKey,
//                             {
//                                 expiresIn: "1h",
//                             }
//                         );
//                         console.log("accessToken:", accessToken);
//                         return res.json({
//                             status: 200,
//                             message: "Login success",
//                             data: accessToken,
//                             userId: foundUser.Item.userId.S,
//                             userNickname: foundUser.Item.userNickname.S,
//                         });
//                     } else {
//                         console.log("Error : jwt is invalid!!");
//                     }
//                 }
//             }
//         }
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send("Internal Server Error");
//     }
// };

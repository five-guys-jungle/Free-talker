import { Request, Response } from "express";
import { IUserInfo, User } from "../models/User";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

export const login = async (req: Request, res: Response) => {
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
                // when found User
                const match = await bcrypt.compare(userPw, foundUser.userPw);
                if (match) {
                    console.log("비밀번호 일치");
                }
                if (typeof jwtKey === "string" && match) {
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
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
};

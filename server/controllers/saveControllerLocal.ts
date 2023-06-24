import { Request, Response } from "express";
import { IUserInfo, User } from "../models/User";

// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

export const saveDialogLocal = async (req: Request, res: Response) => {
    try {
        const { userId, timestamp, nickname, npc,
            userTexture, score, corrections, messages } = req.body;

        const foundUserById = await User.findOne({ userId: userId });
        console.log("foundUserById : ", foundUserById);

        const existingDialogs = await User.collection.find({ nickname: nickname }).toArray();
        console.log("existingDialog:", existingDialogs);
        
        const insertResult = await User.collection.insertOne({
          userId: Math.random(),
          userPw: Math.random(),
          userNickname: Math.random(),
          timestamp: timestamp,
          nickname: nickname,
          npc: npc,
          userTexture: userTexture,
          score: score,
          corrections: corrections,
          messages: messages,
        });
  
        if (!!insertResult) {
          console.log("Successfully created save report");
          return res.json({
            success: true,
            message: "Successfully created save report",
            status: 200, // 200: 성공
          });
        }
          
    } catch (err) {
        console.log(err);
    }
};


export const deleteDialogLocal = async (req: Request, res: Response) => {
    try {
        const { nickname, timestamp } = req.body;

        const existingDialogs = await User.collection.find({nickname: nickname }).toArray();

        if (existingDialogs.length > 0) {
            const deleteDialog = async (timestamp:string) => {
              const dialogToDelete = existingDialogs.find(dialog => dialog.timestamp === timestamp);
              if (dialogToDelete) {
                const deleteResult = await User.collection.updateOne(
                  { nickname: nickname },
                  { $unset: { [timestamp]: "" } }
                );
                if (deleteResult.modifiedCount === 1) {
                  console.log("Successfully deleted dialog");
                }
              }
            };
            await deleteDialog(timestamp);
        }
        else{
            console.log("There is no dialog");
            return res.json({
            success: true,
            message: "There is no dialog",
            status: 200, // 200: 성공
          });
        }

      } catch (err) {
        console.log(err);
      }
};
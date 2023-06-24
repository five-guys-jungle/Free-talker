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

        const existingDialogs = await User.collection.find({ userId: userId }).toArray();

        const newDialog = {
            timestamp,
            nickname,
            npc,
            userTexture,
            score,
            corrections,
            messages,
          };
      
          if (existingDialogs.length > 0) {
            // 이미 사용자 데이터가 존재하는 경우
            const newDialogKey = `dialog${existingDialogs.length + 1}`;
      
            const updateResult = await User.collection.updateOne(
              { userId: userId },
              { $set: { [newDialogKey]: newDialog } }
            );
      
            if (updateResult.modifiedCount === 1) {
              console.log("Successfully updated save report");
              return res.json({
                success: true,
                message: "Successfully updated save report",
                status: 200, // 200: 성공
              });
            }
          } else {
            // 사용자 데이터가 존재하지 않는 경우
            const insertResult = await User.collection.insertOne({
              userId: userId,
              dialog1: newDialog,
            });
      
            if (!!insertResult) {
              console.log("Successfully created save report");
              return res.json({
                success: true,
                message: "Successfully created save report",
                status: 200, // 200: 성공
              });
            }
          }
    } catch (err) {
        console.log(err);
    }
};


export const deleteDialogLocal = async (req: Request, res: Response) => {
    try {
        const { userId, timestamp } = req.body;
        
        const foundUserById = await User.findOne({ userId: userId });
        console.log("foundUserById : ", foundUserById);

        const existingDialogs = await User.collection.find({ userId: userId }).toArray();

        if (existingDialogs.length > 0) {
            const deleteDialog = async (timestamp:string) => {
              const dialogToDelete = existingDialogs.find(dialog => dialog.timestamp === timestamp);
              if (dialogToDelete) {
                const deleteResult = await User.collection.updateOne(
                  { userId: userId },
                  { $unset: { [`data.${dialogToDelete._id}`]: "" } }
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

        const deleteResult = await User.collection.updateOne(
          { userId: userId },
          { $unset: { [`data.dialog${timestamp}`]: "" } }
        );
    

      } catch (err) {
        console.log(err);
      }
};
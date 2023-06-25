import { Request, Response } from "express";
// import { IUserInfo, User} from "../models/User";
import { DialogInfo, Dialog} from "../models/Dialog";

// const userIdRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
// const userNicknameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/; //hanguel, number, alphbet,  not allows special char and white space

export const saveDialogLocal = async (req: Request, res: Response) => {
    try {
        const { userId, timestamp, nickname, npc,
            userTexture, score, corrections, messages } = req.body;

        const existingDialogs = await Dialog.collection.find({ userId : userId }).toArray();
        console.log("existingDialog:", existingDialogs);
        
        const insertResult = await Dialog.collection.insertOne({
          userId: userId,
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
        const { userId, timestamp } = req.body;

        const existingDialogs = await Dialog.collection.find({userId : userId }).toArray();
        console.log(timestamp)

        if (existingDialogs.length > 0) {
            const deleteDialog = async (timestamp:string) => {
              const dialogToDelete = existingDialogs.find(dialog => dialog.timestamp === timestamp);
              console.log("deleteDialog: ",dialogToDelete)
              if (dialogToDelete) {
                const deleteResult = await Dialog.collection.deleteMany(
                  { userId : userId ,
                   timestamp: timestamp }
                );
                if (deleteResult.deletedCount === 1) {
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


export const loadDialogLocal = async (req: Request, res: Response) => {
  try {
      const { userId } = req.body;

      const existingDialogs = await Dialog.collection.find({ userId : userId  }).toArray();
      console.log("existingDialog:", existingDialogs);
      
      return res.json({
        existingDialogs
    });
      
      // const insertResult = await Dialog.collection.insertOne({
      //   userId: userId,
      //   timestamp: timestamp,
      //   nickname: nickname,
      //   npc: npc,
      //   userTexture: userTexture,
      //   score: score,
      //   corrections: corrections,
      //   messages: messages,
      // });

      // if (!!insertResult) {
      //   console.log("Successfully created save report");
      //   return res.json({
      //     success: true,
      //     message: "Successfully created save report",
      //     status: 200, // 200: 성공
      //   });
      // }
        
  } catch (err) {
      console.log(err);
  }
};

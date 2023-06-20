import { Server as SocketIOServer, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { convertSpeechToText, textCompletion, convertTexttoSpeech, grammerCorrection } from "./interaction";



export function interactSocketEventHandler(socket: Socket) {
    console.log("Interaction socket connected, socketid: ", socket.id);
    socket.on("audioSend", async (data:
        {
            userNickname: string;
            npcName: string;
            audioDataBuffer: ArrayBuffer;
        }) => {
        // console.log("audioSend, data: ", data);
        const buffer = Buffer.from(data.audioDataBuffer);
        const filePath = path.join(__dirname, `../audio/user_audio/${data.userNickname}_${data.npcName}_${uuidv4()}.wav`);
        fs.writeFileSync(filePath, buffer); // 동기적으로 실행
        // console.log("User audio file saved at: ", filePath);

        let inputText: string;
        let outputText: string
        let correctedText: string;
        let response: any;

        inputText = await convertSpeechToText(filePath).
            then(async (res) => {
                socket.emit("speechToText", res);
                return res
            });
        console.log("User: ", inputText);
        outputText = await textCompletion(inputText).then(async (res) => {
            socket.emit("npcResponse", res);
            return res
        });
        response = await convertTexttoSpeech(inputText, outputText)
        .then((res) => {
            socket.emit("totalResponse", res);
            console.log("Total response: ", res);
        });
    });

    socket.on("disconnect", (reason: string) => {
        console.log("Interaction socket disconnected, id: ", socket.id, ", reason: ", reason);
    });
}

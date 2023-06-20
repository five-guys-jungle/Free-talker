import { Server as SocketIOServer, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { ConversationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { preDefinedPrompt } from "../models/Prompt";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";
import { ChainValues } from "langchain/dist/schema";
import {
    convertSpeechToText,
    textCompletion,
    convertTexttoSpeech,
    grammerCorrection,
    recommendNextResponses,
    recommendExpressions,
    createChain,
} from "./interaction";

export function interactSocketEventHandler(socket: Socket) {
    let conversation: string[] = [];
    const MAX_CONVERSATION_LENGTH = 100;
    let chain: ConversationChain;
    let count = 0;
    console.log("Interaction socket connected, socketid: ", socket.id);

    socket.on(
        "audioSend",
        async (data: {
            userNickname: string;
            npcName: string;
            audioDataBuffer: ArrayBuffer;
        }) => {

            /* ---------------------------------------------------------------------------------------  */

            if (count++ == 0) {
                const chat = new ChatOpenAI({
                    modelName: "gpt-3.5-turbo",
                    temperature: 0,
                });
                const chatPrompt = ChatPromptTemplate.fromPromptMessages([
                    SystemMessagePromptTemplate.fromTemplate(
                        preDefinedPrompt[data.npcName].message
                    ),
                    new MessagesPlaceholder("history"),
                    HumanMessagePromptTemplate.fromTemplate("{input}"),
                ]);

                const memory = new BufferMemory({
                    returnMessages: true,
                    // memoryKey: "history",
                    chatHistory: new RedisChatMessageHistory({
                        sessionId: new Date().toISOString(),
                        sessionTTL: 300,
                        config: {
                            url: "redis://localhost:6379",
                        },
                    }),
                });
                chain = new ConversationChain({
                    memory: memory,
                    prompt: chatPrompt,
                    llm: chat,
                });
                console.log("chain created.");
            }
            /* ---------------------------------------------------------------------------------------  */
            // const chain: ConversationChain = await createChain(data.npcName);
            // console.log("audioSend, data: ", data);
            const buffer = Buffer.from(data.audioDataBuffer);
            const filePath = path.join(
                __dirname,
                `../audio/user_audio/${data.userNickname}_${
                    data.npcName
                }_${uuidv4()}.wav`
            );
            fs.writeFileSync(filePath, buffer); // 동기적으로 실행
            // console.log("User audio file saved at: ", filePath);

            let inputText: string;
            let outputText: string;
            // let chainOutput: Promise<ChainValues>;
            let correctedText: string;
            let recommendedText: string;
            let response: any;

            inputText = await convertSpeechToText(filePath).then(
                async (res) => {
                    conversation.push(res);

                    // if (conversation.length > MAX_CONVERSATION_LENGTH) { // 대화 길어질 경우 가장 오래된 메시지 삭제
                    //     conversation.shift();
                    // }

                    socket.emit("speechToText", res);
                    return res;
                }
            );
            console.log("User: ", inputText);

            const fullConversation = conversation.join(" ");
            console.log("Full conversation: ", fullConversation);

            const chainOutput = await chain.call({ input: inputText });
            outputText = chainOutput.response;
            socket.emit("npcResponse", outputText);
            // console.log("LangChain OutputText: ", outputText);
            // outputText = await textCompletion(inputText, chain).then(
            //     async (res) => {
            //         socket.emit("npcResponse", res);
            //         return res;
            //     }
            // );
            response = await convertTexttoSpeech(inputText, outputText).then(
                (res) => {
                    socket.emit("totalResponse", res);
                    console.log("Total response: ", res);
                }
            );

            await recommendNextResponses(outputText, "airport")
                .then((res) => {
                    socket.emit("recommendedResponses", res);
                    console.log("recommended Responses: ", res);
                    return res;
                })
                .catch((err) => {
                    console.log("Recommend Responses Error: ", err);
                    recommendedText = "";
                });
        }
    );

    socket.on("disconnect", (reason: string) => {
        console.log(
            "Interaction socket disconnected, id: ",
            socket.id,
            ", reason: ",
            reason
        );
    });
}

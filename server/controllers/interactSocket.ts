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
    grammarCorrection,
    checkIfSoundsGood,
    recommendNextResponses,
    recommendExpressions,
    createChain,
} from "./interaction";

export function interactSocketEventHandler(socket: Socket) {
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
            // 소켓이 연결되고 처음으로 유저가 오디오를 입력하면, 유저와 NPC 간의 Conversation Chain을 생성한다.
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
                `../audio/user_audio/${data.userNickname}_${data.npcName
                }_${uuidv4()}.wav`
            );
            fs.writeFileSync(filePath, buffer); // 동기적으로 실행

            let inputText: string;
            let outputText: string;
            let correctedText: string;
            let recommendedText: string;
            let response: any;

            inputText = await convertSpeechToText(filePath).then(
                async (res) => {
                    socket.emit("speechToText", res);
                    return res;
                }
            );
            
            // console.log("User: ", inputText);
            console.log("chain 호출 시작");
            var startTime: any = new Date();
            const chainOutput = await chain.call({ input: inputText });


            var endTime: any = new Date();
            var elapsedTime: any = endTime - startTime; // 밀리초 단위

            console.log(`실행 시간: ${elapsedTime}ms`);
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

            grammarCorrection(inputText).then(
                async (res) => {
                    if (!checkIfSoundsGood(res)){
                        socket.emit("grammarCorrection", {
                            userText: inputText,
                            correctedText: res,
                        });
                        console.log("socket emitted grammarCorrection.");
                        return res;
                    }
                }
            )

            // socket.on("getRecommendedResponses", async (alreadyRecommended) => {
            //     if (!alreadyRecommended) {
            //         await recommendNextResponses(outputText, "airport")
            //             .then((res) => {
            //                 socket.emit("recommendedResponses", res);
            //                 console.log("recommended Responses: ", res);
            //                 return res;
            //             })
            //             .catch((err) => {
            //                 console.log("Recommend Responses Error: ", err);
            //                 recommendedText = "";
            //             });
            //     }
            // });
        }
    );
    socket.on("getRecommendedResponses", async (alreadyRecommended: boolean, outputText: string) => {
        if (!alreadyRecommended) {
            console.log("getRecommendedResponses start");
            await recommendNextResponses(outputText, "airport")
                .then((res) => {
                    if (res === "ChatGPT API Error.") {
                        socket.emit("recommendedResponses", [outputText]);
                    }
                    else {
                        socket.emit("recommendedResponses", res);
                    }
                    console.log("recommended Responses: ", res);
                    return res;
                })
                .catch((err) => {
                    console.log("Recommend Responses Error: ", err);
                    // recommendedText = "";
                });

            
            // TODO : res 받아서, correct -> 안보냄, incorrect -> 비율 계산해서, 틀렸으면 
        }
    });

    socket.on("disconnect", (reason: string) => {
        console.log(
            "Interaction socket disconnected, id: ",
            socket.id,
            ", reason: ",
            reason
        );
    });
}

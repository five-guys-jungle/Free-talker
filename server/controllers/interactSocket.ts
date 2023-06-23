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
    compareWithCorrectedText,
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
                createChain(data.npcName) //
                    .then((res) => {
                        chain = res;
                        console.log("chain 생성 완료");
                    })
                    .catch((err) => {
                        console.log("chain 생성 실패");
                    });
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

            let inputText: string;
            let outputText: string;
            let correctedText: string;
            let recommendedText: string;
            let response: any;

            // 입력 음성 " "이면 -> "다시 말씀해주세요" 출력
            // NPC 대답 돌아올 때까지 R, E block 되어 있으므로 풀어줘야 함

            await convertSpeechToText(filePath) //
                .then(async (res) => {
                    inputText = res;
                    socket.emit("speechToText", res);
                    if (inputText !== "") {
                        console.log("chain 호출 시작");
                        var startTime: any = new Date();

                        const chainOutput = await chain
                            .call({ input: inputText })
                            .then(async (res) => {
                                var endTime: any = new Date();
                                var elapsedTime: any = endTime - startTime; // 밀리초 단위

                                console.log(`실행 시간: ${elapsedTime}ms`);
                                outputText = res.response;
                                socket.emit("npcResponse", outputText);

                                response = await convertTexttoSpeech(
                                    inputText,
                                    outputText
                                )
                                    .then((res) => {
                                        socket.emit("totalResponse", res);
                                        console.log("Total response: ", res);
                                    })
                                    .catch((err) => {
                                        console.log(
                                            "convert Text to Speech error: ",
                                            err
                                        );
                                    });
                                grammarCorrection(inputText).then(
                                    async (res) => {
                                        if (
                                            !checkIfSoundsGood(res) &&
                                            !compareWithCorrectedText(
                                                inputText,
                                                res
                                            )
                                        ) {
                                            socket.emit("grammarCorrection", {
                                                userText: inputText,
                                                correctedText: res,
                                            });
                                            console.log(
                                                "socket emitted grammarCorrection."
                                            );
                                            return res;
                                        }
                                    }
                                );
                            })
                            .catch((err) => {
                                console.log("chain call error: ", err);
                            });
                    }

                    return res;
                }) //
                .catch((err) => {
                    console.log("convert Speech to Text error: ", err);
                });
        }
    );
    socket.on(
        "getRecommendedResponses",
        async (alreadyRecommended: boolean, outputText: string) => {
            if (!alreadyRecommended) {
                console.log("getRecommendedResponses start");
                await recommendNextResponses(outputText, "airport")
                    .then((res) => {
                        if (res === "ChatGPT API Error.") {
                            socket.emit("recommendedResponses", [outputText]);
                        } else {
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

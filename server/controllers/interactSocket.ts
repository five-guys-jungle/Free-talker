import { Server as SocketIOServer, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";

import { ConversationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,
} from "langchain/prompts";
import { preDefinedPrompt } from "../models/Prompt";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";
import { ChainValues } from "langchain/dist/schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
    translateText,
} from "./interaction";


export function interactSocketEventHandler(socket: Socket) {
    let chain: ConversationChain;
    let npcSentence: string;
    console.log("Interaction socket connected, socketid: ", socket.id);

    const s3Client = new S3Client({ region: "ap-northeast-2" });
    socket.on("dialogStart", async (npcName: string, level: string) => {
        console.log("dialogStart");
        console.log("level: ", level);
        // 소켓이 연결되면, 유저와 NPC 간의 Conversation Chain을 생성한다.
        await createChain(npcName, level)
            .then((res) => {
                chain = res;
                console.log("chain 생성 완료");
            })
            .catch((err) => {
                console.log("chain 생성 실패");
            });

        const prompt = preDefinedPrompt[npcName].start;
        await chain
            .call({ input: prompt })
            .then(async (res) => {
                npcSentence = res.response;
                // socket.emit("npcFirstResponse", npcSentence);

                await convertTexttoSpeech(prompt, npcSentence, npcName, level)
                    .then((res) => {
                        socket.emit("npcFirstResponse", res);
                        console.log("npcFirstResponse response: ", res);
                    })
                    .catch((err) => {
                        console.log("convert Text to Speech error: ", err);
                    });
            })
            .catch((err) => {
                npcSentence = "Hello, How can I assist you today?"
                convertTexttoSpeech(prompt, npcSentence, npcName, level)
                    .then((res) => {
                        socket.emit("npcFirstResponse", res);
                        console.log("npcFirstResponse response: ", res);
                    })
                    .catch((err) => {
                        console.log("convert Text to Speech error: ", err);
                    });

                console.log("chain call error: ", err);
            });

        // TODO : npcInfo 받고, npcInfo를 기반으로 유저에게 대화 전송
    });

    socket.on(
        "audioSend",
        async (data: {
            userNickname: string;
            npcName: string;
            audioDataBuffer: ArrayBuffer;
            level: string;
        }) => {

            try {
                // Conver ArrayBuffer to Buffer
                const buffer = Buffer.from(data.audioDataBuffer);

                const audioFileName = `${data.userNickname}_${data.npcName}_${uuidv4()}.wav`;
                // const filePath = path.join(
                //     __dirname,
                //     `../audio/user_audio/${audioFileName}`
                // );

                // fs.writeFileSync(filePath, buffer); // 동기적으로 실행

                // Define the bucket name and file name
                const bucketName = process.env.S3_BUCKET_NAME;

                const uploadParams = {
                    Bucket: bucketName,
                    Key: audioFileName,
                    Body: buffer,
                    ContentType: 'audio/wav',
                }

                await s3Client.send(new PutObjectCommand(uploadParams));
                const s3Url: string = `https://${bucketName}.s3.amazonaws.com/${audioFileName}`;

                console.log(`${audioFileName} is uploaded to S3 Bucket.`);
                console.log(`s3Url : ${s3Url}`);

                let inputText: string;
                let outputText: string;
                let correctedText: string;
                let recommendedText: string;
                let response: any;

                // 입력 음성 " "이면 -> "다시 말씀해주세요" 출력
                // NPC 대답 돌아올 때까지 R, E block 되어 있으므로 풀어줘야 함

                await convertSpeechToText(s3Url) //
                    .then(async (res: any) => {
                        inputText = res.transcription;
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

                                    // socket.emit("npcResponse", outputText);

                                    response = await convertTexttoSpeech(
                                        inputText,
                                        outputText,
                                        data.npcName,
                                        data.level
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
                                    socket.emit("speechToText", { transcription: "chain call error" });
                                    console.log("chain call error: ", err);
                                });
                        }

                        return res;
                    }) //
                    .catch((err) => {
                        socket.emit("speechToText", { transcription: "chain call error" });
                        console.log("convert Speech to Text error: ", err);
                    });
            } catch (err) {
                console.log(err);
            }
        }
    );
    socket.on(
        "getRecommendedResponses",
        async (
            npcName: string,
            alreadyRecommended: boolean,
            outputText: string
        ) => {
            if (!alreadyRecommended) {
                console.log("getRecommendedResponses start");
                await recommendNextResponses(outputText, npcName)
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

    socket.on(
        "requestTTS", async (
            sentence: string,
            id: number,
            NPCName: string,
            level: string
        ) => {
        const trimmedSentence = sentence.split(':')[1]?.trim();
        convertTexttoSpeech(
            "",
            trimmedSentence,
            NPCName,
            level
        ).then((res) => {
            const result: any = res;
            result.id = id;
            socket.emit("responseTTS", result);
            console.log("responseTTS: ", result);
        })
            .catch((err) => {
                console.log(
                    "convert Text to Speech error: ",
                    err
                );
            });

    }

    )


    socket.on("translation", async (text: string) => {
        console.log("translate start");
        const translatedText = await translateText(text);
        // console.log("translatedText: ", translatedText);
        socket.emit("translatedText", translatedText);
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

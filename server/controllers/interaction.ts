import { Request, Response } from "express";
import { OpenAIApi, Configuration } from "openai";
import toArray from 'stream-to-array';
import { v4 as uuidv4 } from "uuid";
import texttoSpeech from "@google-cloud/text-to-speech";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { preDefinedPrompt } from "../models/Prompt";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";
import { preDefinedVoiceType } from "../models/voiceType";

dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
dotenv.config();
if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: ".env.production" });
} else {
    dotenv.config({ path: ".env.development" });
}
const serverUrl: string = process.env.SERVER_URL!;
const openai = new OpenAIApi(configuration);

// console.log("cur_dir_name : ", __dirname);
const keyPath = __dirname + "/../config/text-to-speech-key.json";

const client = new texttoSpeech.TextToSpeechClient({
    keyFilename: keyPath,
});

const s3Client = new S3Client({ region: "ap-northeast-2" });

// Function to convert speech to text
export async function convertSpeechToText(
    audioFilePath: string
): Promise<string> {
    try {
        const data: FormData = new FormData();
        let response_STT: any;
        let transcription: string;
        let result: any;

        let fileName = audioFilePath.split('/').pop();

        const getParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName
        }

        const command = new GetObjectCommand(getParams);
        const item = await s3Client.send(command);

        // We will convert the stream into a Buffer, because axios can't handle the stream directly

        if (item.Body instanceof Readable) {
            const parts = await toArray(item.Body);
            const audioBuffer = Buffer.concat(parts);

            data.append("file", audioBuffer, {
                filename: fileName, // You need to specify filename
                contentType: 'audio/wav', // And content type, adjusted for .wav audio files
            });
        }
        data.append("model", "whisper-1");
        data.append("language", "en");
        response_STT = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            data,
            {
                headers: {
                    ...data.getHeaders(),
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
        transcription = response_STT.data.text;

        const audioUrl: string = audioFilePath.replace('https://bucket-fiveguys-audio.s3.ap-northeast-2.amazonaws.com', 'https://freetalker.site/s3bucket');

        result = {
            transcription: transcription,
            audioUrl: audioUrl,
        }

        return result;
    } catch (err) {
        console.log("음성 파일 변환 실패");
        console.log(err);
        return "";
    }
    // Implement your logic to convert speech to text using the appropriate libraries or APIs
}

export async function createChain(npcName: string, level: string): Promise<ConversationChain> {
    const chat = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0,
        timeout: 11000,
        maxTokens: 1200,
    });

    try {
        if (!preDefinedPrompt[npcName]) {
            throw new Error(`Invalid npcName: ${npcName}`);
        }
        const chatPrompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(
                preDefinedPrompt[npcName].message(level)
            ),
            new MessagesPlaceholder("history"),
            HumanMessagePromptTemplate.fromTemplate("{input}"),
        ]);

        const memory = new BufferMemory({
            returnMessages: true,
            chatHistory: new RedisChatMessageHistory({
                sessionId: new Date().toISOString(),
                sessionTTL: 300,
                config: {
                    url: "redis://localhost:6379",
                },
            }),
        });

        return new ConversationChain({
            memory: memory,
            prompt: chatPrompt,
            llm: chat,
        });
    } catch (error) {
        throw error;
    }
}

// TODO: 인자로 NPC 이름을 받아서 preDefindPrompt에서 해당 NPC의 prompt를 가져오도록 수정 필요
export async function textCompletion(
    inputText: string,
    chain: ConversationChain
): Promise<string> {
    let completion: any;
    let role_answer: string;

    try {
        const response = await chain.call({
            input: inputText,
        });

        // console.log(`LLM response : ${response.response}`);
        return response.response;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

export async function convertTexttoSpeech(
    inputText: string,
    outputText: string,
    npcName: string = "ImmigrationOfficer",
    level: string = "intermediate"
): Promise<Object> {
    // console.log("convertTexttoSpeech, level: ", level);
    try {
        let rate: number = 1.0;
        if (level === "beginner") {
            rate = 1.0;
        } else if (level === "intermediate") {
            rate = 1.2;
        } else if (level === "advanced") {
            rate = 1.45;
        }

        // console.log(`convertTexttoSpeech, inputText: ${inputText}, outputText: ${outputText}`);
        const request: any = {
            // input: { ssml: ssmlText },
            input: { text: outputText },
            voice: {
                languageCode: "en-US",
                name: preDefinedVoiceType[npcName].voiceType,
            },
            audioConfig: {
                audioEncoding: "MP3",
                speakingRate: rate,
                pitch: preDefinedVoiceType[npcName].pitch,
            },
        };
        const [response_audio]: any = await client.synthesizeSpeech(request);

        // Define the bucket name and file name
        const bucketName = process.env.S3_BUCKET_NAME;
        const audioFileName = `${uuidv4()}.mp3`;


        const uploadParams = {
            Bucket: bucketName,
            Key: audioFileName,
            Body: Buffer.from(response_audio.audioContent),
            ContentType: 'audio/mpeg',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        const s3Url: string = `https://${bucketName}.s3.amazonaws.com/${audioFileName}`;
        const audioUrl: string = s3Url.replace(`https://${bucketName}.s3.ap-northeast-2.amazonaws.com`, 'https://freetalker.site/s3bucket');

        let result = {
            user: inputText,
            assistant: outputText,
            audioUrl: audioUrl,
        };

        // console.log("result: ", result);
        return result;


    } catch (error) {
        console.log(error);
        return { error: "text-to-speech request failed." };
    }
}



export async function grammarCorrection(inputText: string): Promise<string> {
    let response: any;
    let correction: string;
    try {
        // ChatGPT API에 요청 보내기
        // "You are a grammar checker that looks for mistakes and makes sentence’s more fluent. You take all the input and auto correct it. Just reply to user input with the correct grammar, DO NOT reply the context of the question of the user input. If the user input is grammatically correct, just reply “sounds good”:\n\n${inputText}"
        // Make it correct in grammar and Do not give the reason for this change If it doesn't have grammatical issues, do not give a correction.
        // If it doesn't have grammatical issues, do not give a correction.
        // check the following text for spelling and grammar errors
        response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `"You are a grammar checker that check the following text for spelling and grammar errors. If the text is grammatically correct then reply just “sounds good”. else correct this without any explanation. :\n\n${inputText}"`,
            temperature: 0,
            max_tokens: 120,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        // ChatGPT API의 결과 받기
        correction = response.data.choices[0].text.trimStart();
        console.log(
            `corrected text: ${correction}\n original text: ${inputText}`
        );
        return correction;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

export async function recommendExpressions(place: string) {
    let response: any;
    let recommendations: string;
    try {
        response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Recommend me three expressions I can use in a ${place}."`,
            temperature: 0.5,
            max_tokens: 120,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        recommendations = response.data.choices[0].text.trimStart();
        return recommendations;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

export async function recommendNextResponses(
    previous: string,
    npcName: string = "airport immigration officer",
    level: string = "intermediate",
) {
    let response: any;
    let recommendations: string;

    try {
        const prompt = preDefinedPrompt[npcName].message(level);

        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `I'm currently talking with the ${npcName}. Recommend me three expressions, one positive, one neutral, and one negative, that I can use to respond to the sentence that ${previous} without any explanations, at a ${level} level of English proficiency`,
                },
                {
                    role: "user",
                    content: `I'm currently talking with the ${npcName}. Recommend me three expressions, one positive, one neutral, and one negative, that I can use to respond to the sentence that ${previous} without any explanations, at a ${level} level of English proficiency`,
                },
                {
                    role: "user",
                    content: "reply three sentences in maximum",
                },
            ],
            // messages: {`I'm currently at the ${place}, Recommend me three expressions I can reply to the ${previous} without any explanations`,}
            temperature: 0.2,
            max_tokens: 180,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        console.log(response.data.choices[0].message["content"]);
        recommendations = response.data.choices[0].message["content"]
            .split("\n")
            .filter(Boolean)
            .map((sentence: string) => sentence.split(": ")[1]);
        return recommendations;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

function preprocessSentence(sentence: string): string {
    if (!sentence) {
        console.error("Invalid sentence:", sentence);
        return "";
    }
    const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
    const lowercaseSentence = sentence
        .replace(punctuationRegex, "")
        .toLowerCase();
    return lowercaseSentence;
}

export function checkIfSoundsGood(sentence: string): boolean {
    const targetPhrase = "sounds good";
    const lowercaseSentence = preprocessSentence(sentence);
    if (lowercaseSentence.trim() === "") {
        return true;
    }
    return lowercaseSentence.includes(targetPhrase);
}

export function compareWithCorrectedText(
    inputText: string,
    correctedText: string
): boolean {
    if (inputText === "you") return true;
    const lowercaseInputText = preprocessSentence(inputText);
    const lowercaseCorrectedText = preprocessSentence(correctedText);
    return lowercaseInputText === lowercaseCorrectedText;
}
export async function translateText(
    text: string,
) {
    let response: any;
    let translations: string;
    try {
        // ChatGPT API에 요청 보내기
        // "You are a grammar checker that looks for mistakes and makes sentence’s more fluent. You take all the input and auto correct it. Just reply to user input with the correct grammar, DO NOT reply the context of the question of the user input. If the user input is grammatically correct, just reply “sounds good”:\n\n${inputText}"
        // Make it correct in grammar and Do not give the reason for this change If it doesn't have grammatical issues, do not give a correction.
        // If it doesn't have grammatical issues, do not give a correction.
        // check the following text for spelling and grammar errors
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    // content: `transform this sentence '${text}' into form like this '[english word]: [korean word]\n'.`,
                    content: `Translate this sentence '${text}' into korean without explanation and korean pronunciation.`,
                },
                {
                    role: "user",
                    // content: `transform this sentence '${text}' into form like this '[english word]: [korean word]\n'.`,
                    content: `Translate this sentence '${text}' into korean without explanation and korean pronunciation.`,
                },
            ],
            // messages: {`I'm currently at the ${place}, Recommend me three expressions I can reply to the ${previous} without any explanations`,}
            temperature: 0,
            max_tokens: 300,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        // ChatGPT API의 결과 받기
        translations = response.data.choices[0].message['content'];
        // console.log(response.data.choices[0].message)
        console.log(`translations:\n${translations}`);
        return translations;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}
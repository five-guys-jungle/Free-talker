import { Request, Response } from "express";
import { OpenAIApi, Configuration } from "openai";
import multer from "multer";
import util from "util";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import texttoSpeech from "@google-cloud/text-to-speech";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
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

console.log("cur_dir_name : ", __dirname);
const keyPath = __dirname + "/../config/text-to-speech-key.json";
// const keyPath = __dirname + "/../api-keys/project-test-388706-ac6d82af0f41.json";

const client = new texttoSpeech.TextToSpeechClient({
    keyFilename: keyPath,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/../audio/user_audio"); // 음성 파일을 저장할 폴더 경로 지정
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}.mp3`); // 음성 파일 이름 지정
    },
});
export const upload = multer({ storage });

// Function to process the user's voice input
export async function interact(req: Request, res: Response): Promise<void> {
    console.log("NPC Interaction Start.");
    const voiceFile = req.file;
    const chain = await createChain("ImmigrationOfficer");
    if (voiceFile && voiceFile.size > 0) {
        // Convert speech to text
        const audioFilePath = voiceFile.path;
        console.log(audioFilePath);
        let inputText: string;
        let outputText: string;

        inputText = await convertSpeechToText(audioFilePath);
        const correctedText = await grammarCorrection(inputText);

        console.log(`correctedText: ${correctedText}, inputText: ${inputText}`);

        outputText = await textCompletion(inputText, chain);
        const response = await convertTexttoSpeech(inputText, outputText);
        // console.log("response: ", response);
        res.json(response);

        // Call the ChatGPT API with the extracted text and process the response
        // Implement your logic to interact with the ChatGPT API

        // Call the Text to Speech API to generate the response audio
        // Implement your logic to convert text to speech using the appropriate libraries or APIs
        // Return the response to the user
    } else {
        res.status(400).json({ error: "NPC Interaction Fail." });
    }
}

// Function to convert speech to text
export async function convertSpeechToText(
    audioFilePath: string
): Promise<string> {
    try {
        const data: FormData = new FormData();
        let response_STT: any;
        let transcription: string;

        data.append("file", fs.createReadStream(audioFilePath));
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
        return transcription;
    } catch (err) {
        console.log("음성 파일 변환 실패");
        console.log(err);
        return "";
    }
    // Implement your logic to convert speech to text using the appropriate libraries or APIs
}

export async function createChain(npcName: string): Promise<ConversationChain> {
    const chat = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0,
        timeout: 11000,
        maxTokens: 60,
    });

    try {
        if (!preDefinedPrompt[npcName]) {
            throw new Error(`Invalid npcName: ${npcName}`);
        }
        const chatPrompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(
                preDefinedPrompt[npcName].message
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
        // const chain: ConversationChain = new ConversationChain({
        //     memory: new BufferMemory({
        //         returnMessages: true,
        //         memoryKey: "history",
        //     }),
        //     prompt: chatPrompt,
        //     llm: chat,
        // });
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
    // npcName: string = "ImmigrationOfficer",
    chain: ConversationChain
): Promise<string> {
    let completion: any;
    let role_answer: string;

    try {
        const response = await chain.call({
            input: inputText,
        });

        console.log(`LLM response : ${response.response}`);
        // ChatGPT API에 요청 보내기
        // console.log("preDefindPrompt: ",
        // preDefindPrompt['Immigration Officer'].messages.
        // concat([{ role: "user", content: inputText }]));

        // completion = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: preDefinedPrompt[npcName].messages.concat([
        //         { role: "user", content: inputText },
        //     ]),
        // });
        // ChatGPT API의 결과 받기
        // role_answer = completion.data.choices[0].message["content"];
        // console.log("NPC: ", role_answer);
        return response.response;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

export async function convertTexttoSpeech(
    inputText: string,
    outputText: string
): Promise<Object> {
    try {
        const request: any = {
            input: { text: outputText },
            voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
            audioConfig: { audioEncoding: "MP3" },
        };
        const [response_audio]: any = await client.synthesizeSpeech(request);
        const audioFileName = `${uuidv4()}.mp3`;
        const writeFile = util.promisify(fs.writeFile);

        await writeFile(
            `audio/npc_audio/${audioFileName}`,
            response_audio.audioContent,
            "binary"
        );
        const audioFileUrl: string = `${serverUrl}/audio/npc_audio/${audioFileName}`;

        let result = {
            user: inputText,
            assistant: outputText,
            audioUrl: audioFileUrl,
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
            max_tokens: 60,
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
            max_tokens: 60,
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
    place: string = "airport immigration office"
) {
    let response: any;
    let recommendations: string;

    try {
        response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `I'm currently at the ${place}, Recommend me three expressions I can reply to the sentence that ${previous} without any explanations`,
                },
                {
                    role: "user",
                    content: `I'm currently at the ${place}, Recommend me three expressions I can reply to the sentence that ${previous} without any explanations`,
                },
            ],
            // messages: {`I'm currently at the ${place}, Recommend me three expressions I can reply to the ${previous} without any explanations`,}
            temperature: 0.2,
            max_tokens: 50,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        recommendations = response.data.choices[0].message["content"]
            .trim()
            .split("\n")
            .map((sentence: string) => sentence.trim());
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
    const lowercaseInputText = preprocessSentence(inputText);
    const lowercaseCorrectedText = preprocessSentence(correctedText);
    return lowercaseInputText === lowercaseCorrectedText;
}

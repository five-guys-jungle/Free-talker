import { Request, Response } from "express";
import { OpenAIApi, Configuration } from "openai";
import multer from "multer";
import util from "util";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import texttoSpeech from "@google-cloud/text-to-speech";
import FormData from "form-data";
import axios from "axios";
import "dotenv/config";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const serverUrl: string = "http://localhost:5000";
const openai = new OpenAIApi(configuration);

console.log("cur_dir_name : ", __dirname);

const keyPath = __dirname + "/../api-keys/text-to-speech-key.json";

const client = new texttoSpeech.TextToSpeechClient({
    keyFilename: keyPath,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/../audio/uploads"); // 음성 파일을 저장할 폴더 경로 지정
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
    if (voiceFile && voiceFile.size > 0) {
        // Convert speech to text
        const audioFilePath = voiceFile.path;
        console.log(audioFilePath);
        let inputText: string;
        let outputText: string;

        inputText = await convertSpeechToText(audioFilePath);
        outputText = await textCompletion(inputText);
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
async function convertSpeechToText(audioFilePath: string): Promise<string> {
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

async function textCompletion(inputText: string): Promise<string> {
    let completion: any;
    let role_answer: string;
    try {
        // ChatGPT API에 요청 보내기
        completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a cashier at a starbucks in the United States. You can answer any question a customer asks, and you can say anything.",
                },
                {
                    role: "user",
                    content:
                        "You are a cashier at a starbucks in the United States. You can answer any question a customer asks, and you can say anything.",
                },
                {
                    role: "assistant",
                    content:
                        "You are a cashier at a starbucks in the United States. You can answer any question a customer asks, and you can say anything.",
                },
                { role: "user", content: "reply three sentences in maximum" },
                { role: "user", content: inputText },
            ],
        });
        // ChatGPT API의 결과 받기
        role_answer = completion.data.choices[0].message["content"];
        console.log("NPC: ", role_answer);
        return role_answer;
    } catch (error) {
        console.log(error);
        return "ChatGPT API Error.";
    }
}

async function convertTexttoSpeech(
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

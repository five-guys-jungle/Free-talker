export interface Dialog {
    userId: string;
    timestamp: number;
    nickname: string;
    npc: string;
    userTexture: string;
    score: number;
    corrections: Correction[];
    messages: Message[];
}

export interface Message {
    userId: string;
    name: string;
    img: string;
    side: string;
    text: string;
}

export interface Correction {
    original: string;
    correction: string;
}

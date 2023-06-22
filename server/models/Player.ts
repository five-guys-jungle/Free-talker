export interface Player {
    socketId: string;
    nickname: string;
    playerTexture: string;
    x: number;
    y: number;
}

export interface PlayerDictionary {
    [key: string]: Player;
}

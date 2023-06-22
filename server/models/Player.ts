export interface Player {
    socketId: string;
    nickname: string;
    playerTexture: string;
    x: number;
    y: number;
    scene: string;
}

export interface PlayerDictionary {
    [key: string]: Player;
}

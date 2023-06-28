export interface Player {
    socketId: string;
    nickname: string;
    playerTexture: string;
    x: number;
    y: number;
    scene: string;
    dash: boolean;
    seat: boolean;
}

export interface PlayerDictionary {
    [key: string]: Player;
}

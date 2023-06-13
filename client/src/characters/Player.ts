export class Player {
    socketId!: string;
    nickname!: string;
    playerTexture!: string;
    x: number;
    y: number;
    sprite: Phaser.Physics.Arcade.Sprite;

    constructor(
        socketId: string,
        name: string,
        texture: string,
        sprite: Phaser.Physics.Arcade.Sprite,
        x: number,
        y: number
    ) {
        this.socketId = socketId;
        this.nickname = name;
        this.playerTexture = texture;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
}

export interface PlayerDictionary {
    [key: string]: Player;
}
export interface PlayerInfo {
    socketId: string;
    nickname: string;
    playerTexture: string;
    x: number;
    y: number;
}
export interface PlayerInfoDictionary {
    [key: string]: {
        socketId: string;
        nickname: string;
        playerTexture: string;
        x: number;
        y: number;
    };
}

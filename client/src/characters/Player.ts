export class Player {
    socketId!: string;
    nickname!: string;
    playerTexture!: string;
    x: number;
    y: number;
    scene!: string;
    sprite: Phaser.Physics.Arcade.Sprite;
    textObj: Phaser.GameObjects.Text | null = null;
    defaultVelocity: number = 200;

    constructor(
        socketId: string,
        name: string,
        playerTexture: string,
        sprite: Phaser.Physics.Arcade.Sprite,
        x: number,
        y: number,
        scene: string
    ) {
        this.socketId = socketId;
        this.nickname = name;
        this.playerTexture = playerTexture;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.sprite.texture.key = playerTexture;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.scene = scene;
    }
    move() {}
    moveText(scene: Phaser.Scene) {
        if (this.textObj === null || this.textObj === undefined) {
            this.textObj = scene.add.text(
                this.sprite.x,
                this.sprite.y - 45,
                this.nickname,
                {
                    color: "black",
                    fontSize: "16px",
                }
            );
            this.textObj.setOrigin(0.5, 0);
        } else {
            this.textObj!.setX(this.sprite.x);
            this.textObj!.setY(this.sprite.y - 50);
        }
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
    scene: string;
}
export interface PlayerInfoDictionary {
    [key: string]: {
        socketId: string;
        nickname: string;
        playerTexture: string;
        x: number;
        y: number;
        scene: string;
    };
}

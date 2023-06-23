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
    move(deltaInSecond: number) {
        let destination: { x: number; y: number } = { x: this.x, y: this.y };
        let thisSprite: Phaser.Physics.Arcade.Sprite = this.sprite;
        const dialgonalVelocity: number = this.defaultVelocity / Math.SQRT2;
        if (destination.x !== thisSprite.x || destination.y !== thisSprite.y) {

            let distanceX: number = destination.x - thisSprite.x;
            let distanceY: number = destination.y - thisSprite.y;
            // left-up
            if (distanceX < 0 && distanceY < 0) {
                thisSprite.anims.play(`${this.playerTexture}_run_left`, true);
                thisSprite.x -= (dialgonalVelocity * deltaInSecond);
                thisSprite.y -= (dialgonalVelocity * deltaInSecond);
            }
            // left-down
            else if (distanceX < 0 && distanceY > 0) {
                thisSprite.anims.play(`${this.playerTexture}_run_down`, true);
                thisSprite.x -= (dialgonalVelocity * deltaInSecond);
                thisSprite.y += (dialgonalVelocity * deltaInSecond);
            }
            // right-up
            else if (distanceX > 0 && distanceY < 0) {
                thisSprite.anims.play(`${this.playerTexture}_run_right`, true);
                thisSprite.x += (dialgonalVelocity * deltaInSecond);
                thisSprite.y -= (dialgonalVelocity * deltaInSecond);
            }
            // right-down
            else if (distanceX > 0 && distanceY > 0) {
                thisSprite.anims.play(`${this.playerTexture}_run_down`, true);
                thisSprite.x += (dialgonalVelocity * deltaInSecond);
                thisSprite.y += (dialgonalVelocity * deltaInSecond);
            }
            else {
                if (destination.x < thisSprite.x) {
                    thisSprite.anims.play(`${this.playerTexture}_run_left`, true);
                    thisSprite.x -= (this.defaultVelocity * deltaInSecond);
                }
                else if (destination.x > thisSprite.x) {
                    thisSprite.anims.play(`${this.playerTexture}_run_right`, true);
                    thisSprite.x += (this.defaultVelocity * deltaInSecond);
                }


                if (destination.y < thisSprite.y) {
                    thisSprite.anims.play(`${this.playerTexture}_run_up`, true);
                    thisSprite.y -= (this.defaultVelocity * deltaInSecond);
                }
                else if (destination.y > thisSprite.y) {
                    thisSprite.anims.play(`${this.playerTexture}_run_down`, true);
                    thisSprite.y += (this.defaultVelocity * deltaInSecond);
                }
            }

            if (distanceX < 2) {
                thisSprite.x = destination.x;
                // console.log('Other player is alomost close to destination X');
            }
            if (distanceY < 2) {
                thisSprite.y = destination.y;
                // console.log('Other player is alomost close to destination Y');
            }
        }
        else {
            thisSprite.anims.play(`${this.playerTexture}_idle_down`, true);
            // console.log('Other player is not moving');
        }
    }
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

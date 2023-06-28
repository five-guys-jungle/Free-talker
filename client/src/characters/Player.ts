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
    dashVelocity: number = 600;
    dash: boolean = false;
    seat: boolean = false;

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
        const velocity: number = this.dash
            ? this.dashVelocity
            : this.defaultVelocity;
        const dialgonalVelocity: number = velocity / Math.SQRT2;

        // console.log('Other player seat: ', this.seat);
        if (this.seat) {
            // console.log(`${this.playerTexture}_sit_left`);
            this.sprite.anims.play(`${this.playerTexture}_sit_left`, true);
        } else {
            if (
                destination.x !== thisSprite.x ||
                destination.y !== thisSprite.y
            ) {
                console.log("Other player is moving, dash: ", this.dash);
                let distanceX: number = destination.x - thisSprite.x;
                let distanceY: number = destination.y - thisSprite.y;
                // left-up
                if (distanceX < 0 && distanceY < 0) {
                    if (thisSprite.anims.isPlaying) {
                        if (
                            thisSprite.anims.currentAnim?.key !==
                            `${this.playerTexture}_run_left`
                        ) {
                            thisSprite.anims.play(
                                `${this.playerTexture}_run_left`,
                                true
                            );
                        }
                    }
                    thisSprite.x -= dialgonalVelocity * deltaInSecond;
                    thisSprite.y -= dialgonalVelocity * deltaInSecond;
                }
                // left-down
                else if (distanceX < 0 && distanceY > 0) {
                    if (thisSprite.anims.isPlaying) {
                        if (
                            thisSprite.anims.currentAnim?.key !==
                            `${this.playerTexture}_run_down`
                        ) {
                            thisSprite.anims.play(
                                `${this.playerTexture}_run_down`,
                                true
                            );
                        }
                    }
                    thisSprite.x -= dialgonalVelocity * deltaInSecond;
                    thisSprite.y += dialgonalVelocity * deltaInSecond;
                }
                // right-up
                else if (distanceX > 0 && distanceY < 0) {
                    if (thisSprite.anims.isPlaying) {
                        if (
                            thisSprite.anims.currentAnim?.key !==
                            `${this.playerTexture}_run_right`
                        ) {
                            thisSprite.anims.play(
                                `${this.playerTexture}_run_right`,
                                true
                            );
                        }
                    }
                    thisSprite.x += dialgonalVelocity * deltaInSecond;
                    thisSprite.y -= dialgonalVelocity * deltaInSecond;
                }
                // right-down
                else if (distanceX > 0 && distanceY > 0) {
                    if (thisSprite.anims.isPlaying) {
                        if (
                            thisSprite.anims.currentAnim?.key !==
                            `${this.playerTexture}_run_down`
                        ) {
                            thisSprite.anims.play(
                                `${this.playerTexture}_run_down`,
                                true
                            );
                        }
                    }
                    thisSprite.x += dialgonalVelocity * deltaInSecond;
                    thisSprite.y += dialgonalVelocity * deltaInSecond;
                } else {
                    if (destination.x < thisSprite.x) {
                        if (thisSprite.anims.isPlaying) {
                            if (
                                thisSprite.anims.currentAnim?.key !==
                                `${this.playerTexture}_run_left`
                            ) {
                                thisSprite.anims.play(
                                    `${this.playerTexture}_run_left`,
                                    true
                                );
                            }
                        }
                        thisSprite.x -= velocity * deltaInSecond;
                    } else if (destination.x > thisSprite.x) {
                        if (thisSprite.anims.isPlaying) {
                            if (
                                thisSprite.anims.currentAnim?.key !==
                                `${this.playerTexture}_run_right`
                            ) {
                                thisSprite.anims.play(
                                    `${this.playerTexture}_run_right`,
                                    true
                                );
                            }
                        }
                        thisSprite.x += velocity * deltaInSecond;
                    } else if (destination.y < thisSprite.y) {
                        if (thisSprite.anims.isPlaying) {
                            if (
                                thisSprite.anims.currentAnim?.key !==
                                `${this.playerTexture}_run_up`
                            ) {
                                thisSprite.anims.play(
                                    `${this.playerTexture}_run_up`,
                                    true
                                );
                            }
                        }
                        thisSprite.y -= velocity * deltaInSecond;
                    } else if (destination.y > thisSprite.y) {
                        if (thisSprite.anims.isPlaying) {
                            if (
                                thisSprite.anims.currentAnim?.key !==
                                `${this.playerTexture}_run_down`
                            ) {
                                thisSprite.anims.play(
                                    `${this.playerTexture}_run_down`,
                                    true
                                );
                            }
                        }
                        thisSprite.y += velocity * deltaInSecond;
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
            } else {
                if (thisSprite.anims.isPlaying) {
                    let idle_anims: string = thisSprite.anims.currentAnim!.key;
                    idle_anims = idle_anims.replace("run", "idle");
                    thisSprite.anims.play(idle_anims, true);
                }
                // thisSprite.anims.play(`${this.playerTexture}_idle_down`, true);
                // console.log('Other player is not moving');
            }
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
    dash: boolean;
    seat: boolean;
}
export interface PlayerInfoDictionary {
    [key: string]: PlayerInfo;
}

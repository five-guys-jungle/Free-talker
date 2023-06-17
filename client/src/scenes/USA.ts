import Phaser from "phaser";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import {
    Player,
    PlayerDictionary,
    PlayerInfo,
    PlayerInfoDictionary,
} from "../characters/Player";
import { frameInfo } from "./common/anims";
import { useRecoilValue } from "recoil";
import {
    playerIdState,
    playerNicknameState,
    playerTextureState,
} from "../recoil/user/atoms";
// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";
// import "./airPort"

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

export default class USAScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    npc: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    initial_x: number = 1920;
    initial_y: number = 720;
    allPlayers: PlayerDictionary = {};

    recorder: MediaRecorder | null = null;
    socket: Socket | null = null;

    playerId: string = "";
    userNickname: string = "";
    playerTexture: string = "";

    constructor() {
        super("USAScene");
    }

    preload() {
        // this.load.image("background", "assets/backgrounds/space.png");
        // this.load.image("generic", "assets/tilesets/Generic.png");
        // this.load.image("basement", "assets/tilesets/Basement.png");
        // this.load.image("floor", "assets/tilesets/FloorAndGround.png");
        // this.load.image("interior", "assets/tilesets/Interiors.png");
        // this.load.image(
        //     "pixel",
        //     "assets/tilesets/pixel-cyberpunk-interior.png"
        // );
        // this.load.image(
        //     "classroom",
        //     "assets/tilesets/Classroom_and_library.png"
        // );
        // this.load.image('exterior','assets/tilesets/ModernExteriorsComplete.png');

        // this.load.spritesheet("npc", "assets/characters/npc.png", {
        //     frameWidth: 48,
        //     frameHeight: 72,
        //     startFrame: 0,
        //     endFrame: 12,
        // });
        // this.load.spritesheet("adam", "assets/characters/adam.png", {
        //     frameWidth: 32,
        //     frameHeight: 48,
        // });
        // this.load.spritesheet("ash", "assets/characters/ash.png", {
        //     frameWidth: 32,
        //     frameHeight: 48,
        // });
        // this.load.spritesheet("lucy", "assets/characters/lucy.png", {
        //     frameWidth: 32,
        //     frameHeight: 48,
        // });
        // this.load.spritesheet("nancy", "assets/characters/nancy.png", {
        //     frameWidth: 32,
        //     frameHeight: 48,
        // });

        this.load.tilemapTiledJSON("map1", "assets/maps/usa.json");
    }

    init(data: any) {
        this.playerId = data.playerId;
        this.userNickname = data.playerNickname;
        this.playerTexture = data.playerTexture;
        console.log("data: ", data);
    }

    create() {
        // this.add.image(400, 300, "background");
        // 배경 설정
        const map1 = this.make.tilemap({ key: "map1" });
        console.log(map1);
        const tileset_generic = map1.addTilesetImage("Generic", "generic")!;
        const tileset_basement = map1.addTilesetImage("Basement", "basement")!;
        const tileset_interior = map1.addTilesetImage("Interiors", "interior")!;
        const tileset_classroom = map1.addTilesetImage(
            "Classroom_and_library",
            "classroom"
        )!;
        const tileset_floor = map1.addTilesetImage("FloorAndGround", "floor")!;
        const tileset_pixel = map1.addTilesetImage(
            "pixel-cyberpunk-interior",
            "pixel"
        )!;
        const tileset_exterior = map1.addTilesetImage(
            "ModernExteriorsComplete",
            "exterior"
        )!;

        map1.createLayer("background/Floor", tileset_floor);
        const platform22 = map1.createLayer("boundary/Floor", tileset_floor)!;
        const platform33 = map1.createLayer("floor/Floor", tileset_floor)!;
        const platform44 = map1.createLayer("park/Exterior", tileset_exterior)!;
        const platform55 = map1.createLayer(
            "parkstuff/Exterior",
            tileset_exterior
        )!;
        const platform66 = map1.createLayer(
            "cityblock/Exterior",
            tileset_exterior
        )!;
        const platform77 = map1.createLayer(
            "citystuff/Exterior",
            tileset_exterior
        )!;

        platform22.setCollisionByProperty({ collides: true });
        platform33.setCollisionByProperty({ collides: true });
        platform44.setCollisionByProperty({ collides: true });
        platform55.setCollisionByProperty({ collides: true });
        platform66.setCollisionByProperty({ collides: true });
        platform77.setCollisionByProperty({ collides: true });

        createCharacterAnims(this.anims);

        this.socket = io("https://seunghunshin.shop");

        this.socket.on("connect", () => {
            console.log("connect, socket.id: ", this.socket!.id);
            // create user
            console.log("playerInfo : ", {
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
            });
            this.player1 = this.createPlayer({
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
                scene: "USAScene",
            });
            this.player1.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정
            this.cameras.main.startFollow(this.player1);

            this.socket!.emit("connected", {
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
                scene: "USAScene",
            });

            this.socket!.on(
                "updateAlluser",
                (otherPlayers: PlayerInfoDictionary) => {
                    console.log("updateAlluser, allPlayers: ", otherPlayers);
                    for (let key in otherPlayers) {
                        console.log("updateAlluser, key: ", key);
                        if (otherPlayers[key].socketId !== this.socket!.id) {
                            if (
                                !(otherPlayers[key].socketId in this.allPlayers)
                            ) {
                                let playerSprite: Phaser.Physics.Arcade.Sprite =
                                    this.createPlayer(otherPlayers[key]);
                                playerSprite.setCollideWorldBounds(true);
                                playerSprite.anims.play(
                                    `${otherPlayers[key].playerTexture}_idle_down`,
                                    true
                                );
                            } else {
                                console.log(
                                    "updateAlluser, already exist, so just set position"
                                );
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].sprite.x = otherPlayers[key].x;
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].sprite.y = otherPlayers[key].y;
                            }
                        }
                    }
                }
            );

            this.socket!.on("newPlayerConnected", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    console.log("newPlayerConnected, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        this.allPlayers[playerInfo.socketId].sprite.x =
                            playerInfo.x;
                        this.allPlayers[playerInfo.socketId].sprite.y =
                            playerInfo.y;
                        console.log(
                            "newPlayerConnected, playerSprite: ",
                            this.allPlayers[playerInfo.socketId].sprite
                        );
                    } else {
                        console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        playerSprite.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정;
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerMoved", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    console.log("playerMoved, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        this.allPlayers[playerInfo.socketId].sprite.x =
                            playerInfo.x;
                        this.allPlayers[playerInfo.socketId].sprite.y =
                            playerInfo.y;
                    } else {
                        console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        playerSprite.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정;
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerDeleted", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    console.log("playerDeleted, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("exist, deleted");
                        this.allPlayers[playerInfo.socketId].sprite.destroy();
                        delete this.allPlayers[playerInfo.socketId];
                    } else {
                        console.log("not exist, so do nothing");
                    }
                }
            });

            this.physics.add.collider(this.player1, platform22);
            this.physics.add.collider(this.player1, platform33);
            this.physics.add.collider(this.player1, platform44);
            this.physics.add.collider(this.player1, platform55);
            this.physics.add.collider(this.player1, platform66);
            this.physics.add.collider(this.player1, platform77);

            this.npc = this.physics.add.sprite(500, 300, "npc");
        });

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.interactKey = this.input.keyboard!.addKey("X");
        this.interactText = this.add.text(10, 10, "", {
            color: "black",
            fontSize: "16px",
        });
        this.userIdText = this.add.text(10, 10, "", {
            color: "black",
            fontSize: "16px",
        });

        this.input.keyboard!.on("keydown-X", async () => {
            if (
                Phaser.Math.Distance.Between(
                    this.player1!.x,
                    this.player1!.y,
                    this.npc!.x,
                    this.npc!.y
                ) < 100
            ) {
                await navigator.mediaDevices
                    .getUserMedia({ audio: true })
                    .then((stream) => {
                        if (
                            this.recorder === null ||
                            this.recorder === undefined
                        ) {
                            console.log("recorder is null, so create new one");
                            this.recorder = new MediaRecorder(stream);
                        }
                        this.recorder.ondataavailable = (e) => {
                            // console.log("ondataavailable_this: ", this);
                            // console.log("ondataavailable_chunks: ", chunks);
                            chunks.push(e.data);
                        };
                        this.recorder.onstop = () => {
                            // console.log("onstop_chunks: ", chunks);
                            const blob = new Blob(chunks, {
                                type: "audio/wav",
                            });
                            // const file = new File([blob], "recording.ogg", { type: blob.type });
                            const formData = new FormData();
                            chunks = [];
                            formData.append("audio", blob, "recording.wav");

                            axios
                                .post(
                                    "https://seunghunshin.shop/interact",
                                    formData,
                                    {
                                        headers: {
                                            "Content-Type":
                                                "multipart/form-data",
                                        },
                                    }
                                )
                                .then((response) => {
                                    // console.log(response);
                                    console.log(response.data);
                                    if (response.data.audioUrl) {
                                        // If the audio URL is provided
                                        const audio = new Audio(
                                            response.data.audioUrl
                                        );
                                        audio.play();
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        };
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                if (this.recorder) {
                    if (this.recorder.state === "recording") {
                        this.recorder.stop();
                    } else {
                        this.recorder.start();
                    }
                }
            }
        });
    }
    update() {
        this.cursors = this.input.keyboard!.createCursorKeys();
        const speed = 200;
        let velocityX = 0;
        let velocityY = 0;

        // `${this.player1!.texture.key}_idle_left`
        if (this.player1 !== null && this.player1 !== undefined) {
            if (this.cursors!.left.isDown) {
                velocityX = -speed;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_left`,
                    true
                );
            } else if (this.cursors!.right.isDown) {
                velocityX = speed;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_right`,
                    true
                );
            }

            if (this.cursors!.up.isDown) {
                velocityY = -speed;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_up`,
                    true
                );
            } else if (this.cursors!.down.isDown) {
                velocityY = speed;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_down`,
                    true
                );
            }

            // If moving diagonally, adjust speed
            if (velocityX !== 0 && velocityY !== 0) {
                velocityX /= Math.SQRT2;
                velocityY /= Math.SQRT2;
            }

            this.player1!.setVelocityX(velocityX);
            this.player1!.setVelocityY(velocityY);

            if (velocityX === 0 && velocityY === 0) {
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_idle_down`
                );
            }
        }

        if (this.player1 !== null && this.player1 !== undefined) {
            console.log("userNickname : ", this.userNickname);
            this.userIdText!.setText(this.userNickname);
            this.userIdText!.setOrigin(0.5, 0);
            this.userIdText!.setX(this.player1!.x);
            this.userIdText!.setY(this.player1!.y - 50);

            // Check distance between players
            if (
                Phaser.Math.Distance.Between(
                    this.player1!.x,
                    this.player1!.y,
                    this.npc!.x,
                    this.npc!.y
                ) < 100
            ) {
                this.interactText!.setText("Press X to interact");
                // interactText position
                this.interactText!.setOrigin(0.5, 0);
                this.interactText!.setX(this.player1!.x);
                this.interactText!.setY(this.player1!.y - 70);
            } else {
                this.interactText!.setText("");
            }
        }

        if (
            this.socket !== null &&
            this.socket !== undefined &&
            this.player1 !== null &&
            this.player1 !== undefined
        ) {
            if (velocityX !== 0 || velocityY !== 0) {
                this.socket!.emit("playerMovement", {
                    socketId: this.socket!.id,
                    nickname: this.userNickname,
                    playerTexture: this.playerTexture,
                    x: this.player1!.x,
                    y: this.player1!.y,
                    scene: "USAScene",
                });
            }
        }
    }
    createPlayer(playerInfo: PlayerInfo): Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'

        this.socket!.emit("getTexture", playerInfo);
        let playerSprite = this.physics.add.sprite(
            playerInfo.x,
            playerInfo.y,
            playerInfo.playerTexture
        );

        // Create a new player instance
        const newPlayer = new Player(
            playerInfo.socketId,
            playerInfo.nickname,
            playerInfo.playerTexture,
            playerSprite,
            playerInfo.x,
            playerInfo.y,
            playerInfo.scene
        );

        // Add the sprite to the Phaser scene
        // this.add.existing(newPlayer.sprite);
        // this.physics.add.existing(newPlayer.sprite);
        // this.anims.play(`${playerInfo.playerTexture}_idle_down`, true);
        console.log("createPlayer, newPlayer: ", newPlayer);
        this.allPlayers[playerInfo.socketId] = newPlayer;
        console.log("createPlayer, allPlayers: ", this.allPlayers);
        return playerSprite;
    }
}

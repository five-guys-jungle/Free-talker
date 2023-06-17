import Phaser from "phaser";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import store from "../stores/index";
import { keyboard } from "@testing-library/user-event/dist/keyboard";
import phaserGame from "../phaserGame";
import {
    Player,
    PlayerDictionary,
    PlayerInfo,
    PlayerInfoDictionary,
} from "../characters/Player";
import { frameInfo } from "./common/anims";

// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";
import { openNPCDialog } from "../stores/gameSlice";
import { handleScene } from "./common/handleScene";

import dotenv from "dotenv";

const serverUrl: string = process.env.REACT_APP_SERVER_URL!;

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

export default class AirportScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    npc: Phaser.Physics.Arcade.Sprite | null = null;
    portal: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    initial_x: number = 1920;
    initial_y: number = 1440;
    allPlayers: PlayerDictionary = {};

    recorder: MediaRecorder | null = null;
    socket: Socket | null = null;

    playerId: string = "";
    userNickname: string = "";
    playerTexture: string = "";

    userText: Phaser.GameObjects.Text | null = null;
    npcText: Phaser.GameObjects.Text | null = null;
    socket2: Socket | null = null;
    interacting: boolean = false;
    recorder2: MediaRecorder | null = null;

    constructor() {
        super("AirportScene");
    }

    preload() {
        this.load.tilemapTiledJSON("map", "assets/maps/airport.json");

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
        const map = this.make.tilemap({ key: "map" });
        const tileset_generic = map.addTilesetImage("Generic", "generic")!;
        const tileset_basement = map.addTilesetImage("Basement", "basement")!;
        const tileset_interior = map.addTilesetImage("Interiors", "interior")!;
        const tileset_classroom = map.addTilesetImage(
            "Classroom_and_library",
            "classroom"
        )!;
        const tileset_floor = map.addTilesetImage("FloorAndGround", "floor")!;
        const tileset_pixel = map.addTilesetImage(
            "pixel-cyberpunk-interior",
            "pixel"
        )!;

        map.createLayer("floor/Floor", tileset_floor);
        const platform2 = map.createLayer("wall/Generic", tileset_generic)!;
        const platform3 = map.createLayer(
            "chair_door/Generic",
            tileset_generic
        )!;
        const platform4 = map.createLayer(
            "chair_table/Basement",
            tileset_basement
        )!;
        const platform5 = map.createLayer(
            "office/Classroom",
            tileset_classroom
        )!;
        const platform6 = map.createLayer(
            "interiors/Interiors",
            tileset_interior
        )!;
        const platform7 = map.createLayer("line/pixel", tileset_pixel)!;

        platform2.setCollisionByProperty({ collides: true });
        platform3.setCollisionByProperty({ collides: true });
        platform4.setCollisionByProperty({ collides: true });
        platform5.setCollisionByProperty({ collides: true });
        platform6.setCollisionByProperty({ collides: true });
        platform7.setCollisionByProperty({ collides: true });

        createCharacterAnims(this.anims);

        this.socket = io(serverUrl);

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
                scene: "AirportScene",
            });
            // this.player1.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정
            this.cameras.main.startFollow(this.player1);
            this.cameras.main.zoom = 1.2;

            this.socket!.emit("connected", {
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
                scene: "AirportScene",
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
                                // playerSprite.setCollideWorldBounds(true);
                                playerSprite.anims.play(
                                    `${otherPlayers[key].playerTexture}_idle_down`,
                                    true
                                );
                            } else {
                                console.log(
                                    "updateAlluser, already exist, so just set position"
                                );
                                // this.allPlayers[otherPlayers[key].socketId].sprite.x = otherPlayers[key].x;
                                // this.allPlayers[otherPlayers[key].socketId].sprite.y = otherPlayers[key].y;
                                this.allPlayers[otherPlayers[key].socketId].x =
                                    otherPlayers[key].x;
                                this.allPlayers[otherPlayers[key].socketId].y =
                                    otherPlayers[key].y;

                                let angle = Phaser.Math.Angle.Between(
                                    this.allPlayers[key].sprite.x,
                                    this.allPlayers[key].sprite.y,
                                    otherPlayers[key].x,
                                    otherPlayers[key].y
                                );

                                this.allPlayers[key].sprite.setVelocity(
                                    Math.cos(angle) *
                                    this.allPlayers[key].defaultVelocity,
                                    Math.sin(angle) *
                                    this.allPlayers[key].defaultVelocity
                                );

                                // 스프라이트 방향에 따라 애니메이션 재생
                                if (
                                    Math.abs(
                                        otherPlayers[key].x -
                                        this.allPlayers[key].sprite.x
                                    ) >
                                    Math.abs(
                                        otherPlayers[key].y -
                                        this.allPlayers[key].sprite.y
                                    )
                                ) {
                                    // left or right
                                    if (
                                        otherPlayers[key].x >
                                        this.allPlayers[key].sprite.x
                                    ) {
                                        this.allPlayers[key].sprite.anims.play(
                                            `${this.allPlayers[key].playerTexture}_run_right`,
                                            true
                                        );
                                    } else {
                                        this.allPlayers[key].sprite.anims.play(
                                            `${this.allPlayers[key].playerTexture}_run_left`,
                                            true
                                        );
                                    }
                                } else {
                                    // up or down
                                    if (
                                        otherPlayers[key].y >
                                        this.allPlayers[key].sprite.y
                                    ) {
                                        this.allPlayers[key].sprite.anims.play(
                                            `${this.allPlayers[key].playerTexture}_run_down`,
                                            true
                                        );
                                    } else {
                                        this.allPlayers[key].sprite.anims.play(
                                            `${this.allPlayers[key].playerTexture}_run_up`,
                                            true
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            );

            this.socket!.on("newPlayerConnected", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "AirportScene") {
                    console.log("newPlayerConnected, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        // this.allPlayers[playerInfo.socketId].sprite.x = playerInfo.x;
                        // this.allPlayers[playerInfo.socketId].sprite.y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                        console.log(
                            "newPlayerConnected, playerSprite: ",
                            this.allPlayers[playerInfo.socketId].sprite
                        );

                        let angle = Phaser.Math.Angle.Between(
                            this.allPlayers[playerInfo.socketId].sprite.x,
                            this.allPlayers[playerInfo.socketId].sprite.y,
                            playerInfo.x,
                            playerInfo.y
                        );

                        this.allPlayers[playerInfo.socketId].sprite.setVelocity(
                            Math.cos(angle) *
                            this.allPlayers[playerInfo.socketId]
                                .defaultVelocity,
                            Math.sin(angle) *
                            this.allPlayers[playerInfo.socketId]
                                .defaultVelocity
                        );

                        // 스프라이트 방향에 따라 애니메이션 재생
                        if (
                            Math.abs(
                                playerInfo.x -
                                this.allPlayers[playerInfo.socketId].sprite
                                    .x
                            ) >
                            Math.abs(
                                playerInfo.y -
                                this.allPlayers[playerInfo.socketId].sprite
                                    .y
                            )
                        ) {
                            // left or right
                            if (
                                playerInfo.x >
                                this.allPlayers[playerInfo.socketId].sprite.x
                            ) {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_right`,
                                    true
                                );
                            } else {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_left`,
                                    true
                                );
                            }
                        } else {
                            // up or down
                            if (
                                playerInfo.y >
                                this.allPlayers[playerInfo.socketId].sprite.y
                            ) {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_down`,
                                    true
                                );
                            } else {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_up`,
                                    true
                                );
                            }
                        }
                    } else {
                        console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        // playerSprite.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정;
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerMoved", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "AirportScene") {
                    console.log("playerMoved, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        // this.allPlayers[playerInfo.socketId].sprite.x = playerInfo.x;
                        // this.allPlayers[playerInfo.socketId].sprite.y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;

                        let angle = Phaser.Math.Angle.Between(
                            this.allPlayers[playerInfo.socketId].sprite.x,
                            this.allPlayers[playerInfo.socketId].sprite.y,
                            playerInfo.x,
                            playerInfo.y
                        );

                        this.allPlayers[playerInfo.socketId].sprite.setVelocity(
                            Math.cos(angle) *
                            this.allPlayers[playerInfo.socketId]
                                .defaultVelocity,
                            Math.sin(angle) *
                            this.allPlayers[playerInfo.socketId]
                                .defaultVelocity
                        );

                        // 스프라이트 방향에 따라 애니메이션 재생
                        if (
                            Math.abs(
                                playerInfo.x -
                                this.allPlayers[playerInfo.socketId].sprite
                                    .x
                            ) >
                            Math.abs(
                                playerInfo.y -
                                this.allPlayers[playerInfo.socketId].sprite
                                    .y
                            )
                        ) {
                            // left or right
                            if (
                                playerInfo.x >
                                this.allPlayers[playerInfo.socketId].sprite.x
                            ) {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_right`,
                                    true
                                );
                            } else {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_left`,
                                    true
                                );
                            }
                        } else {
                            // up or down
                            if (
                                playerInfo.y >
                                this.allPlayers[playerInfo.socketId].sprite.y
                            ) {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_down`,
                                    true
                                );
                            } else {
                                this.allPlayers[
                                    playerInfo.socketId
                                ].sprite.anims.play(
                                    `${this.allPlayers[playerInfo.socketId]
                                        .playerTexture
                                    }_run_up`,
                                    true
                                );
                            }
                        }
                    } else {
                        console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        // playerSprite.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정;
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerDeleted", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "AirportScene") {
                    console.log("playerDeleted, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("exist, deleted");
                        this.allPlayers[playerInfo.socketId].textObj?.destroy();
                        this.allPlayers[playerInfo.socketId].sprite.destroy();
                        delete this.allPlayers[playerInfo.socketId];
                    } else {
                        console.log("not exist, so do nothing");
                    }
                }
            });

            this.physics.add.collider(this.player1, platform2);
            this.physics.add.collider(this.player1, platform3);
            this.physics.add.collider(this.player1, platform4);
            this.physics.add.collider(this.player1, platform5);
            this.physics.add.collider(this.player1, platform6);
            this.physics.add.collider(this.player1, platform7);

            this.npc = this.physics.add.sprite(1700, 1100, "npc");
            this.portal = this.physics.add.sprite(1920, 1350, "npc");
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

        this.input.keyboard!.on("keydown-D", async () => {
            if (
                Phaser.Math.Distance.Between(
                    this.player1!.x,
                    this.player1!.y,
                    this.npc!.x,
                    this.npc!.y
                ) < 100
            ) {
                store.dispatch(openNPCDialog());
            }
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
                                    serverUrl + "/interact",
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
            if (
                Phaser.Math.Distance.Between(
                    this.player1!.x,
                    this.player1!.y,
                    this.portal!.x,
                    this.portal!.y
                ) < 100
            ) {
                // this.socket?.on("disconnent", (reason:string="scene-change")=>{
                //     console.log("Client disconnected, id: ", this.socket!.id, ", reason: ", reason);
                //     let playerDeleted: Player = this.allPlayers[this.socket!.id];
                //     delete this.allPlayers[this.socket!.id];
                //     this.socket!.emit("playerDeleted", playerDeleted);
                // })

                this.socket?.disconnect();

                handleScene("USA", {
                    playerId: this.playerId,
                    playerNickname: this.userNickname,
                    playerTexture: this.playerTexture,
                });
            }
        });

        // npc 와의 대화를 위한 키 설정
        this.input.keyboard!.on("keydown-E", async () => {
            if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y,
                this.npc!.x, this.npc!.y) < 100) {
                console.log("E key pressed");
                if (this.socket2 === null || this.socket2 === undefined) {
                    this.socket2 = io(`${serverUrl}/interaction`);
                    this.socket2.on("connect", () => {
                        this.interacting = true;
                        console.log("connect, interaction socket.id: ", this.socket2!.id);
                        this.socket2!.on("textToSpeech", (response: string) => {
                            console.log("USER: ", response);
                            this.userText!.setText(response);
                            this.userText!.setOrigin(0, 0);
                            this.userText!.setX(this.player1!.x + 50);
                            this.userText!.setY(this.player1!.y);
                        });
                        this.socket2!.on("npcResponse", (response: string) => {
                            console.log("NPC: ", response);
                            this.npcText!.setText(response);
                            this.npcText!.setOrigin(0, 0);
                            this.npcText!.setX(this.npc!.x + 50);
                            this.npcText!.setY(this.npc!.y);
                        });
                        this.socket2!.on("totalResponse", (response: any) => {
                            // console.log("totalResponse event response: ", response);
                            const audio = new Audio(response.audioUrl);
                            audio.play();
                        });
                    });
                }
                else { // 이미 소켓이 연결되어 있는데 다시 한번 E키를 누른 경우
                    this.interacting = false;
                    this.socket2?.disconnect();
                    this.socket2 = null;
                }
            }
        });
        // 녹음 데이터를 보내고 응답을 받는 키 설정
        this.input.keyboard!.on("keydown-R", async () => {
            if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y,
                this.npc!.x, this.npc!.y) < 100 && this.socket2?.connected) {
                console.log("R key pressed");

                if (this.recorder2 === null || this.recorder2 === undefined) {
                    await this.recordEventHandler().then(() => {
                        // console.log("recordEventHandler finished");
                    });
                }

                if (this.recorder2) {
                    if (this.recorder2.state === "recording") {
                        this.recorder2!.stop();
                    } else {
                        this.recorder2!.start();
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
                if (this.interacting === false) {
                    this.interactText!.setText("Press E interact");
                    // interactText position
                    this.interactText!.setOrigin(0.5, 0);
                    this.interactText!.setX(this.player1!.x);
                    this.interactText!.setY(this.player1!.y - 70);
                }
                else {
                    if (this.recorder2?.state === "recording") {
                        this.interactText!.setText("Press R to stop recording");
                    }
                    else {
                        this.interactText!.setText("Press R to record");
                    }
                    this.interactText!.setOrigin(0.5, 0);
                    this.interactText!.setX(this.player1!.x);
                    this.interactText!.setY(this.player1!.y - 70);
                }
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
                    scene: "AirportScene",
                });
            }

            for (let key in this.allPlayers) {
                if (key !== this.socket.id) {
                    let otherSprite: Phaser.Physics.Arcade.Sprite =
                        this.allPlayers[key].sprite;
                    let targetPosition: { x: number; y: number } = {
                        x: this.allPlayers[key].x,
                        y: this.allPlayers[key].y,
                    };
                    if (
                        targetPosition &&
                        Phaser.Math.Distance.Between(
                            otherSprite.x,
                            otherSprite.y,
                            targetPosition.x,
                            targetPosition.y
                        ) <= 1.0
                    ) {
                        otherSprite.setVelocity(0, 0);
                        otherSprite.anims.play(
                            `${this.allPlayers[key].playerTexture}_idle_down`,
                            true
                        );
                    }
                    this.allPlayers[key].moveText(this);
                }
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
        console.log("createPlayer, newPlayer: ", newPlayer);
        this.allPlayers[playerInfo.socketId] = newPlayer;
        console.log("createPlayer, allPlayers: ", this.allPlayers);
        return playerSprite;
    }
    async recordEventHandler() {
        console.log("recordEventHandler");

        await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                if (this.recorder2 === null || this.recorder2 === undefined) {
                    console.log("recorder is null, so create new one");
                    this.recorder2 = new MediaRecorder(stream);
                }

                this.recorder2.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                this.recorder2.onstop = () => {
                    const blob: Blob = new Blob(chunks, { type: "audio/wav", });
                    chunks = [];
                    console.log("record2 onstop event callback function");
                    console.log("blob: ", blob);
                    blob.arrayBuffer().then((buffer) => {
                        console.log("buffer: ", buffer);
                        this.socket2!.emit('audioSend',
                            {
                                userNickname: this.userNickname,
                                npcName: "npc", // TODO: npc 이름 받아오기
                                audioDataBuffer: buffer
                            });
                    });
                };
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

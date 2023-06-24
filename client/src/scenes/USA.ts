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
import { useRecoilValue } from "recoil";
import {
    playerIdState,
    playerNicknameState,
    playerTextureState,
} from "../recoil/user/atoms";
// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";

// import "./airPort"
import { npcInfo } from "../characters/Npc";
import dotenv from "dotenv";

const serverUrl: string = process.env.REACT_APP_SERVER_URL!;

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
    npcList: npcInfo[] = [];
    recorder: MediaRecorder | null = null;
    socket: Socket | null = null;

    playerId: string = "";
    userNickname: string = "";
    playerTexture: string = "";
    speed: number = 200;
    dashSpeed: number = 600;

    constructor() {
        super("USAScene");
    }

    preload() {
        this.load.tilemapTiledJSON("map1", "assets/maps/usa_v2.json");
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
        const tileset_exteriors = map1.addTilesetImage(
            "fiveguys_Exteriors",
            "fiveguys_Exteriors"
        )!;
        const tileset_interiors_1 = map1.addTilesetImage(
            "fiveguys_Interiors_1",
            "fiveguys_Interiors_1"
        )!;
        const tileset_interiors_2 = map1.addTilesetImage(
            "fiveguys_Interiors_2",
            "fiveguys_Interiors_2"
        )!;
        const tileset_interiors_3 = map1.addTilesetImage(
            "fiveguys_Interiors_3",
            "fiveguys_Interiors_3"
        )!;
        const tileset_interiors_4 = map1.addTilesetImage(
            "fiveguys_Interiors_4",
            "fiveguys_Interiors_4"
        )!;
        const tileset_roombuilder = map1.addTilesetImage(
            "fiveguys_Room_Builder",
            "fiveguys_Room_Builder"
        )!;
        const tileset_logo = map1.addTilesetImage(
            "fiveguys_logo",
            "fiveguys_logo"
        )!;

        map1.createLayer("background/RoomBuilder", tileset_roombuilder);
        const roombuilder_1 = map1.createLayer(
            "boundary/RoomBuilder",
            tileset_roombuilder
        )!;
        const roombuilder_2 = map1.createLayer(
            "floor/RoomBuilder",
            tileset_roombuilder
        )!;
        const exteriors_1 = map1.createLayer(
            "layer1/Exteriors",
            tileset_exteriors
        )!;
        const exteriors_2 = map1.createLayer(
            "layer2/Exteriors",
            tileset_exteriors
        )!;
        const exteriors_3 = map1.createLayer(
            "layer3/Exteriors",
            tileset_exteriors
        )!;
        const logo = map1.createLayer("logo/logo", tileset_logo)!;
        const interiors_11 = map1.createLayer(
            "layer1/Interiors1",
            tileset_interiors_1
        )!;
        const interiors_12 = map1.createLayer(
            "layer1/Interiors2",
            tileset_interiors_2
        )!;
        const interiors_13 = map1.createLayer(
            "layer1/Interiors3",
            tileset_interiors_3
        )!;
        const interiors_14 = map1.createLayer(
            "layer1/Interiors4",
            tileset_interiors_4
        )!;
        const interiors_22 = map1.createLayer(
            "layer2/Interiors2",
            tileset_interiors_2
        )!;
        const interiors_23 = map1.createLayer(
            "layer2/Interiors3",
            tileset_interiors_3
        )!;
        const interiors_24 = map1.createLayer(
            "layer2/Interiors4",
            tileset_interiors_4
        )!;
        const interiors_32 = map1.createLayer(
            "layer3/Interiors2",
            tileset_interiors_2
        )!;
        const interiors_33 = map1.createLayer(
            "layer3/Interiors3",
            tileset_interiors_3
        )!;

        roombuilder_1.setCollisionByProperty({ collides: true });
        roombuilder_2.setCollisionByProperty({ collides: true });
        exteriors_1.setCollisionByProperty({ collides: true });
        exteriors_2.setCollisionByProperty({ collides: true });
        exteriors_3.setCollisionByProperty({ collides: true });
        interiors_11.setCollisionByProperty({ collides: true });
        interiors_12.setCollisionByProperty({ collides: true });
        interiors_13.setCollisionByProperty({ collides: true });
        interiors_14.setCollisionByProperty({ collides: true });
        interiors_22.setCollisionByProperty({ collides: true });
        interiors_23.setCollisionByProperty({ collides: true });
        interiors_24.setCollisionByProperty({ collides: true });
        interiors_32.setCollisionByProperty({ collides: true });
        interiors_33.setCollisionByProperty({ collides: true });

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
                scene: "USAScene",
                dash: false,
            });
            // this.player1.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정
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
                                // playerSprite.setCollideWorldBounds(true);
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
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].dash = otherPlayers[key].dash;
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
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
                        console.log(
                            "newPlayerConnected, playerSprite: ",
                            this.allPlayers[playerInfo.socketId].sprite
                        );
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
                if (playerInfo.scene === "USAScene") {
                    console.log("playerMoved, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        this.allPlayers[playerInfo.socketId].sprite.x =
                            playerInfo.x;
                        this.allPlayers[playerInfo.socketId].sprite.y =
                            playerInfo.y;
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
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

            this.physics.add.collider(this.player1, roombuilder_1);
            this.physics.add.collider(this.player1, roombuilder_2);
            this.physics.add.collider(this.player1, exteriors_1);
            this.physics.add.collider(this.player1, exteriors_2);
            this.physics.add.collider(this.player1, exteriors_3);
            this.physics.add.collider(this.player1, interiors_11);
            this.physics.add.collider(this.player1, interiors_12);
            this.physics.add.collider(this.player1, interiors_13);
            this.physics.add.collider(this.player1, interiors_14);
            this.physics.add.collider(this.player1, interiors_22);
            this.physics.add.collider(this.player1, interiors_23);
            this.physics.add.collider(this.player1, interiors_24);
            this.physics.add.collider(this.player1, interiors_32);
            this.physics.add.collider(this.player1, interiors_33);
            this.createUSANpc();
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
                                .post(serverUrl + "/interact", formData, {
                                    headers: {
                                        "Content-Type": "multipart/form-data",
                                    },
                                })
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
    update(time: number, delta: number) {
        let speed: number = this.cursors?.shift.isDown
            ? this.dashSpeed
            : this.speed;
        let velocityX = 0;
        let velocityY = 0;

        if (this.player1 !== null && this.player1 !== undefined) {
            // console.log("userNickname : ", this.userNickname);
            this.userIdText!.setText(this.userNickname);
            this.userIdText!.setOrigin(0.5, 0);
            this.userIdText!.setX(this.player1!.x);
            this.userIdText!.setY(this.player1!.y - 50);
        }

        if (
            this.player1 !== null &&
            this.player1 !== undefined &&
            this.cursors!.left.enabled &&
            this.cursors!.right.enabled &&
            this.cursors!.up.enabled &&
            this.cursors!.down.enabled
        ) {
            // First check diagonal movement
            if (this.cursors!.left.isDown && this.cursors!.up.isDown) {
                velocityX = -speed / Math.SQRT2;
                velocityY = -speed / Math.SQRT2;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_left`,
                    true
                );
            } else if (this.cursors!.left.isDown && this.cursors!.down.isDown) {
                velocityX = -speed / Math.SQRT2;
                velocityY = speed / Math.SQRT2;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_down`,
                    true
                );
            } else if (this.cursors!.right.isDown && this.cursors!.up.isDown) {
                velocityX = speed / Math.SQRT2;
                velocityY = -speed / Math.SQRT2;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_right`,
                    true
                );
            } else if (
                this.cursors!.right.isDown &&
                this.cursors!.down.isDown
            ) {
                velocityX = speed / Math.SQRT2;
                velocityY = speed / Math.SQRT2;
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_run_down`,
                    true
                );
            } else {
                // If not moving diagonally, then check horizontal and vertical movement
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
            }

            this.player1!.setVelocityX(velocityX);
            this.player1!.setVelocityY(velocityY);

            if (velocityX === 0 && velocityY === 0) {
                this.player1!.anims.play(
                    `${this.player1!.texture.key}_idle_down`,
                    true
                );
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
                    dash: this.cursors?.shift.isDown,
                });
            }
            for (let key in this.allPlayers) {
                if (key !== this.socket.id) {
                    let deltaInSecond: number = delta / 1000;
                    let otherPlayer: Player = this.allPlayers[key];
                    otherPlayer.move(deltaInSecond);
                    this.allPlayers[key].moveText(this);
                }
            }
        }
    }

    createPlayer(playerInfo: PlayerInfo): Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'
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

    createUSANpc() {
        this.physics.add.sprite(1819, 1200, "statueOfLiberty");

        let npc1: npcInfo = {
            name: "HotelReceptionist",
            x: 650,
            y: 1632,
            texture: "HotelReceptionist",
            sprite: null,
            role: "npc",
        };
        npc1.sprite = this.physics.add.sprite(npc1.x, npc1.y, npc1.texture);
        this.npcList.push(npc1);

        let npc2: npcInfo = {
            name: "Barista",
            x: 1810,
            y: 428,
            texture: "Barista",
            sprite: null,
            role: "npc",
        };
        npc2.sprite = this.physics.add.sprite(npc2.x, npc2.y, npc2.texture);
        this.npcList.push(npc2);

        let npc3: npcInfo = {
            name: "Doctor",
            x: 1741,
            y: 2413,
            texture: "Doctor",
            sprite: null,
            role: "npc",
        };
        npc3.sprite = this.physics.add.sprite(npc3.x, npc3.y, npc3.texture);
        this.npcList.push(npc3);

        let npc4: npcInfo = {
            name: "Nurse",
            x: 1784,
            y: 2413,
            texture: "Nurse",
            sprite: null,
            role: "npc",
        };
        npc4.sprite = this.physics.add.sprite(npc4.x, npc4.y, npc4.texture);
        this.npcList.push(npc4);

        let npc5: npcInfo = {
            name: "ClothingShopStaff",
            x: 3102,
            y: 2235,
            texture: "ClothingShopStaff",
            sprite: null,
            role: "npc",
        };
        npc5.sprite = this.physics.add.sprite(npc5.x, npc5.y, npc5.texture);
        this.npcList.push(npc5);

        let npc6: npcInfo = {
            name: "MartCashier",
            x: 2737,
            y: 1850,
            texture: "MartCashier",
            sprite: null,
            role: "npc",
        };
        npc6.sprite = this.physics.add.sprite(npc6.x, npc6.y, npc6.texture);
        this.npcList.push(npc6);

        let npc7: npcInfo = {
            name: "Chef",
            x: 3216,
            y: 417,
            texture: "Chef",
            sprite: null,
            role: "npc",
        };
        npc7.sprite = this.physics.add.sprite(npc7.x, npc7.y, npc7.texture);
        this.npcList.push(npc7);
    }


}

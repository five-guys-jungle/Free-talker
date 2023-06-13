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
import { BasicScene } from "./BasicScene";
import { useRecoilValue } from "recoil";
import {
    playerIdState,
    playerNicknameState,
    playerTextureState,
} from "../recoil/user/atoms";
// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

class AirPortScene extends BasicScene {
    playerId = "";
    userNickname = "";
    texture = "";

    constructor() {
        super("AirPortScene");
    }

    preload() {
        super.preload();

        this.load.image("generic", "assets/tilesets/Generic.png");
        this.load.image("basement", "assets/tilesets/Basement.png");
        this.load.image("floor", "assets/tilesets/FloorAndGround.png");
        this.load.image("interior", "assets/tilesets/Interiors.png");
        this.load.image(
            "pixel",
            "assets/tilesets/pixel-cyberpunk-interior.png"
        );
        this.load.image(
            "classroom",
            "assets/tilesets/Classroom_and_library.png"
        );

        this.load.spritesheet("npc", "assets/characters/npc.png", {
            frameWidth: 48,
            frameHeight: 72,
            startFrame: 0,
            endFrame: 12,
        });
        this.load.spritesheet("adam", "assets/characters/adam.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("ash", "assets/characters/ash.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("lucy", "assets/characters/lucy.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("nancy", "assets/characters/nancy.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

        this.load.tilemapTiledJSON("map", "assets/maps/airport.json");
    }

    init(data: any) {
        this.playerId = data.playerId;
        this.userNickname = data.playerNickname;
        this.texture = data.playerTexture;
    }

    create() {
        super.create(this.texture);
        console.log("this.texture : ", this.texture);

        console.log(this.playerId);
        console.log(this.userNickname);
        console.log(this.texture); // 'ash'
        // about character frame
        const frameInfo: frameInfo = {
            down: { start: 0, end: 2 },
            left: { start: 3, end: 5 },
            right: { start: 6, end: 8 },
            up: { start: 9, end: 11 },
        };
        //배경이미지 추가
        // this.add.image(400, 300, "background");
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

        // this.player1 = this.physics.add.sprite(this.initial_x, this.initial_y, "player");
        // this.player1.setCollideWorldBounds(true);// player가 월드 경계를 넘어가지 않게 설정

        // this.createAnimation("player", frameInfo);

        // this.allPlayers[this.userNickname] = new Player(this.socketHelper!.getSocketId()!, this.userNickname, this.player1, this.initial_x, this.initial_y);
        const playerInfo: PlayerInfo = {
            socketId: this.socketHelper!.getSocketId()!,
            nickname: this.userNickname,
            playerTexture: this.texture,
            x: this.initial_x,
            y: this.initial_y,
        };

        console.log("playerInfo.playerTexture: ", playerInfo.playerTexture);

        this.player1 = this.createPlayer(playerInfo);

        this.player1.setCollideWorldBounds(true); // player가 월드 경계를 넘어가지 않게 설정
        this.physics.add.collider(this.player1, platform2);
        this.physics.add.collider(this.player1, platform3);
        this.physics.add.collider(this.player1, platform4);
        this.physics.add.collider(this.player1, platform5);
        this.physics.add.collider(this.player1, platform6);
        this.physics.add.collider(this.player1, platform7);

        this.npc = this.physics.add.sprite(500, 300, "npc");
        this.createAnimation("npc", frameInfo);

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
                                    "http://localhost:5000/interact",
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
            this.player1!.anims.play(`${this.player1!.texture.key}_idle_down`);
        }

        console.log("userNickname : ", this.userNickname);
        // this.userIdText!.setText(this.userNickname);
        // interactText position
        // this.userIdText!.setOrigin(0.5, 0);
        // this.userIdText!.setX(this.player1!.x);
        // this.userIdText!.setY(this.player1!.y - 50);

        if (this.socketHelper && this.socketHelper.getSocket()) {
            this.socketHelper!.emitPlayerMovement(
                this.userNickname,
                this.texture,
                this.player1!.x,
                this.player1!.y
            );
        }

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
    createPlayer(playerInfo: PlayerInfo): Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'
        console.log(
            "in function, playerInfo.playerTexture: ",
            playerInfo.playerTexture
        );
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
            playerInfo.y
        );

        // Add the sprite to the Phaser scene
        createCharacterAnims(this.anims);
        this.add.existing(newPlayer.sprite);
        this.physics.add.existing(newPlayer.sprite);
        // this.anims.play(`${playerInfo.playerTexture}_idle_down`, true);
        this.allPlayers[playerInfo.nickname] = newPlayer;
        return playerSprite;
    }
}
export default AirPortScene;

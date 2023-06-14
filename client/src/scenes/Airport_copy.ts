import * as Phaser from "phaser";
import axios from "axios";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { io, Socket } from "socket.io-client";
// import Player from "../../characters/Player";

type NavKeys = {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
};

export default class Airport extends Phaser.Scene {
    socket: Socket | null = null;
    character: Phaser.Physics.Arcade.Sprite | null = null;
    npc: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: NavKeys | null = null;
    keyE: Phaser.Input.Keyboard.Key | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    recording: boolean = false;
    mediaRecorder: MediaRecorder | null = null;
    recordedChunks: Blob[] = [];
    // otherPlayers: Player[];

    // const URL =

    // private person: Phaser.Physics.Arcade.Sprite | null = null;

    constructor() {
        super("game");
        // this.otherPlayers = [];
    }

    preload() {
        this.load.image("space", "assets/background/space.png");
        this.load.spritesheet("adam", "assets/characters/adam.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("npc", "assets/npc.png", {
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
    }

    create() {
        this.socket = io("http://localhost:5000");
        // this.socket = io(URL, {autoConnet: false});
        this.add.image(400, 300, "space");
        this.character = this.physics.add.sprite(100, 150, "adam");
        this.npc = this.physics.add.sprite(800, 400, "npc");
        this.interactText = this.add.text(730, 360, "E키를 눌러 대화하세요", {
            color: "white",
            fontSize: "20px",
        });
        this.interactText.setVisible(false);

        if (this.input && this.input.keyboard) {
            this.keyE = this.input.keyboard.addKey("E");
        }

        if (this.input && this.input.keyboard) {
            this.cursors = {
                up: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.UP
                ),
                down: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.DOWN
                ),
                left: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.LEFT
                ),
                right: this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.RIGHT
                ),
            };
        }

        createCharacterAnims(this.anims);

        console.log("create!");
    }

    update(): void {
        if (this.character && this.cursors) {
            if (this.cursors.up?.isDown) {
                this.character.setVelocityY(-200); // 위로 이동
                this.character.anims.play("adam_idle_up", true);
            } else if (this.cursors.down?.isDown) {
                this.character.setVelocityY(200); // 아래로 이동
                this.character.anims.play("adam_idle_down", true);
            } else {
                this.character.setVelocityY(0); // 멈춤
            }

            if (this.cursors.left?.isDown) {
                this.character.setVelocityX(-200); // 왼쪽으로 이동
                this.character.anims.play("adam_idle_left", true);
            } else if (this.cursors.right?.isDown) {
                this.character.setVelocityX(200); // 오른쪽으로 이동
                this.character.anims.play("adam_idle_right", true);
            } else {
                this.character.setVelocityX(0); // 멈춤
            }
        }

        if (this.npc && this.character) {
            const distance = Phaser.Math.Distance.Between(
                this.character.x,
                this.character.y,
                this.npc.x,
                this.npc.y
            );

            if (distance < 50) {
                this.interactText?.setVisible(true);
                if (this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    console.log("상호작용 키가 눌렸습니다.");

                    if (this.recording) {
                        // 이미 녹음 중인 경우, 녹음을 종료하고 서버로 전송
                        this.mediaRecorder?.stop();
                    } else {
                        // 녹음을 시작
                        navigator.mediaDevices
                            .getUserMedia({ audio: true })
                            .then((stream) => {
                                this.recordedChunks = [];
                                this.mediaRecorder = new MediaRecorder(stream);

                                this.mediaRecorder.addEventListener(
                                    "dataavailable",
                                    (event) => {
                                        console.log("녹음 중...");
                                        if (event.data.size > 0) {
                                            this.recordedChunks.push(
                                                event.data
                                            );
                                        }
                                    }
                                );

                                this.mediaRecorder.addEventListener(
                                    "stop",
                                    () => {
                                        console.log("녹음 종료");

                                        const recordedBlob = new Blob(
                                            this.recordedChunks,
                                            { type: "audio/webm" }
                                        );

                                        this.sendVoiceRecording(recordedBlob);
                                    }
                                );

                                this.mediaRecorder.start();
                            })
                            .catch((error) => {
                                console.error("음성 녹음 시작 실패: ", error);
                            });
                    }

                    this.recording = !this.recording; // 녹음 상태 변경
                }
            } else {
                this.interactText?.setVisible(false);
            }
        }
    }
    sendVoiceRecording(blob: Blob): void {
        const formData = new FormData();
        formData.append("audio", blob);
        console.log("blob : ", blob);
        axios
            .post("http://localhost:5000/interact", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                // console.log(response.data);
                console.log("서버 응답: ", response.data);
                if (response.data.audioUrl) {
                    const audio = new Audio(response.data.audioUrl);
                    audio.play();
                }
            })
            .catch((error) => {
                console.error("오류 발생: ", error);
            });
        // console.log("POST 요청 완료");
    }
}

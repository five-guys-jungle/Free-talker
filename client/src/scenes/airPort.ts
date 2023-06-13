import Phaser from 'phaser';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { keyboard } from '@testing-library/user-event/dist/keyboard';
import { Player, PlayerDictionary, PlayerInfo, PlayerInfoDictionary } from "../characters/Player";
import { frameInfo, createAnimation } from "./common/anims";

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();
let allPlayers: PlayerDictionary = {};

class airPortScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    npc: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    socket: Socket | null = null;
    userNickname: string = '';
    initial_x: number = 400;
    initial_y: number = 300;

    isRecording: boolean = false;
    recorder: MediaRecorder | null = null;
    // chunks: BlobPart[] = [];
    constructor() {
        super('airPortScene');
    }

    preload() {
        this.load.image("background", "assets/backgrounds/space.png");
        this.load.spritesheet("npc", "assets/characters/npc.png", {
            frameWidth: 48,
            frameHeight: 72,
            startFrame: 0,
            endFrame: 12,
        });
        this.load.spritesheet("player", "assets/characters/player.png", {
            frameWidth: 48,
            frameHeight: 72,
            startFrame: 0,
            endFrame: 12,
        });
    }

    create() {
        this.socket = io('http://localhost:5000');
        this.socket.on('connected', (data) => {
            this.userNickname = data.nickname;
            // console.log("connected socket id: ", this.socket!.id);
            // console.log("connected user nickname: ", this.userNickname);

            // player가 생성되면 서버로 'created' 이벤트를 보냄
            this.socket!.emit('created', {
                // emit created player info
                socketId: this.socket!.id,
                nickname: this.userNickname,
                x: this.initial_x,
                y: this.initial_y
            });

            this.socket!.on('playerMoved', (serveredPlayers: PlayerInfoDictionary) => {
                for (let otherPlayerNickname in serveredPlayers) {
                    console.log("player moved called by ", otherPlayerNickname);
                    if (otherPlayerNickname !== this.userNickname) {
                        if (otherPlayerNickname in allPlayers) {
                            allPlayers[otherPlayerNickname].sprite.x = serveredPlayers[otherPlayerNickname].x;
                            allPlayers[otherPlayerNickname].sprite.y = serveredPlayers[otherPlayerNickname].y;
                        }
                        else {
                            let tempPlayerInfo: PlayerInfo = serveredPlayers[otherPlayerNickname];
                            allPlayers[otherPlayerNickname] = new Player(
                                tempPlayerInfo.socketId, tempPlayerInfo.nickname,
                                this.physics.add.sprite(this.initial_x, this.initial_y, "player"),
                                tempPlayerInfo.x, tempPlayerInfo.y);

                            allPlayers[otherPlayerNickname].sprite.setCollideWorldBounds(true);
                        }
                    }
                }
            });
        });
        // about character frame
        const frameInfo: frameInfo = {
            down: { start: 0, end: 2 },
            left: { start: 3, end: 5 },
            right: { start: 6, end: 8 },
            up: { start: 9, end: 11 }
        }
        //배경이미지 추가
        this.add.image(400, 300, 'background');
        this.player1 = this.physics.add.sprite(this.initial_x, this.initial_y, "player");
        this.player1.setCollideWorldBounds(true);// player가 월드 경계를 넘어가지 않게 설정

        createAnimation(this, "player", frameInfo);

        allPlayers[this.userNickname] = new Player(this.socket.id, this.userNickname, this.player1, this.initial_x, this.initial_y);

        this.npc = this.physics.add.sprite(500, 300, "npc");
        createAnimation(this, "npc", frameInfo);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.interactKey = this.input.keyboard!.addKey('X');
        this.interactText = this.add.text(10, 10, '', { color: 'white', fontSize: '16px' });
        this.userIdText = this.add.text(10, 10, '', { color: 'white', fontSize: '16px' });

        // this.interactKey = this.input.keyboard!.addKey('Z');
        // this.input.keyboard!.on('keydown-Z', () => {
        //     if (Phaser.Input.Keyboard.JustDown(this.interactKey!)) {
        //         this.scene.start('airPortScene2'); // 씬 전환
        //     }
        // });



        this.input.keyboard!.on('keydown-X', async () => {
            if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y, this.npc!.x, this.npc!.y) < 100) {
                await navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        if (this.recorder === null || this.recorder === undefined) {
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
                            const blob = new Blob(chunks, { type: 'audio/wav' });
                            // const file = new File([blob], "recording.ogg", { type: blob.type });
                            const formData = new FormData();
                            chunks = [];
                            formData.append('audio', blob, "recording.wav");

                            axios.post('http://localhost:5000/comunicate', formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            })
                                .then((response) => {
                                    // console.log(response);
                                    console.log(response.data);
                                    if (response.data.audioUrl) {  // If the audio URL is provided
                                        const audio = new Audio(response.data.audioUrl);
                                        audio.play();
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                        };
                    })
                    .catch(error => {
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

        if (this.cursors!.left.isDown) {
            velocityX = -speed;
            this.player1!.anims.play('left', true);
        } else if (this.cursors!.right.isDown) {
            velocityX = speed;
            this.player1!.anims.play('right', true);
        }

        if (this.cursors!.up.isDown) {
            velocityY = -speed;
            this.player1!.anims.play('up', true);
        } else if (this.cursors!.down.isDown) {
            velocityY = speed;
            this.player1!.anims.play('down', true);
        }

        // If moving diagonally, adjust speed
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX /= Math.SQRT2;
            velocityY /= Math.SQRT2;
        }

        this.player1!.setVelocityX(velocityX);
        this.player1!.setVelocityY(velocityY);

        if (velocityX === 0 && velocityY === 0) {
            this.player1!.anims.play('down');
        }

        this.userIdText!.setText(this.userNickname);
        // interactText position
        this.userIdText!.setOrigin(0.5, 0);
        this.userIdText!.setX(this.player1!.x);
        this.userIdText!.setY(this.player1!.y - 70);


        this.socket!.emit('playerMovement', {
            socketId: this.socket!.id,
            id: this.userNickname,
            x: this.player1!.x,
            y: this.player1!.y
        });

        // Check distance between players
        if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y, this.npc!.x, this.npc!.y) < 100) {
            this.interactText!.setText('Press X to interact');
            // interactText position
            this.interactText!.setOrigin(0.5, 0);
            this.interactText!.setX(this.player1!.x);
            this.interactText!.setY(this.player1!.y - 50);
        } else {
            this.interactText!.setText('');
        }
    }
}
export default airPortScene;
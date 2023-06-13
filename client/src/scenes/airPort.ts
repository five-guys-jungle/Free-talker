import Phaser from 'phaser';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { keyboard } from '@testing-library/user-event/dist/keyboard';
import { Player, PlayerDictionary, PlayerInfo, PlayerInfoDictionary } from "../characters/Player";
import { frameInfo } from "./common/anims";
import { BasicScene } from "./BasicScene";

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

class AirPortScene extends BasicScene {
    constructor() {
        super('AirPortScene');
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
        // about character frame
        const frameInfo: frameInfo = {
            down: { start: 0, end: 2 },
            left: { start: 3, end: 5 },
            right: { start: 6, end: 8 },
            up: { start: 9, end: 11 }
        }
        //배경이미지 추가
        this.add.image(400, 300, 'background');
        // this.player1 = this.physics.add.sprite(this.initial_x, this.initial_y, "player");
        // this.player1.setCollideWorldBounds(true);// player가 월드 경계를 넘어가지 않게 설정

        this.createAnimation("player", frameInfo);

        // this.allPlayers[this.userNickname] = new Player(this.socketHelper!.getSocketId()!, this.userNickname, this.player1, this.initial_x, this.initial_y);
        const playerInfo: PlayerInfo = {
            socketId: this.socketHelper!.getSocketId()!,
            nickname: this.userNickname,
            x: this.initial_x,
            y: this.initial_y
        };
        this.player1 = this.createPlayer(playerInfo);
        this.player1.setCollideWorldBounds(true);// player가 월드 경계를 넘어가지 않게 설정

        this.npc = this.physics.add.sprite(500, 300, "npc");
        this.createAnimation("npc", frameInfo);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.interactKey = this.input.keyboard!.addKey('X');
        this.interactText = this.add.text(10, 10, '', { color: 'white', fontSize: '16px' });
        this.userIdText = this.add.text(10, 10, '', { color: 'white', fontSize: '16px' });

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
        
        if (this.socketHelper && this.socketHelper.getSocket()) {
            this.socketHelper!.emitPlayerMovement(this.userNickname, this.player1!.x, this.player1!.y);
        }

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
    createPlayer(playerInfo: PlayerInfo):Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'
        let playerSprite = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player');

        // Create a new player instance
        const newPlayer = new Player(playerInfo.socketId, playerInfo.nickname, playerSprite, playerInfo.x, playerInfo.y);

        // Add the sprite to the Phaser scene
        this.add.existing(newPlayer.sprite);
        this.physics.add.existing(newPlayer.sprite);

        this.allPlayers[playerInfo.nickname] = newPlayer;
        return playerSprite;
    }
}
export default AirPortScene;
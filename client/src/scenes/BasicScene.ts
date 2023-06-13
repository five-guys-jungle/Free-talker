import { Player, PlayerDictionary, PlayerInfo, PlayerInfoDictionary } from "../characters/Player";
import { SocketHelper } from "./common/socketHelper";
import io, { Socket } from 'socket.io-client';

export class BasicScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    npc: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    userNickname: string = '';
    initial_x: number = 400;
    initial_y: number = 300;
    allPlayers: PlayerDictionary = {};

    recorder: MediaRecorder | null = null;
    socketHelper: SocketHelper | null = null;

    preload() {
        console.log("preload");
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
        this.socketHelper = new SocketHelper();
        this.socketHelper.initialize();

        this.socketHelper.onConnected((data) => {
            this.userNickname = data.nickname;
            this.socketHelper!.emitCreated(this.userNickname, this.initial_x, this.initial_y);
        });

        this.socketHelper.onPlayerMoved((serveredPlayers: PlayerInfo) => {
            if (serveredPlayers.nickname !== this.userNickname) {
                if (serveredPlayers.nickname in this.allPlayers) {
                    this.allPlayers[serveredPlayers.nickname].sprite.x = serveredPlayers.x;
                    this.allPlayers[serveredPlayers.nickname].sprite.y = serveredPlayers.y;
                }
                else {
                    // You should define createPlayer method in each scene
                    this.createPlayer(serveredPlayers);
                }
            }
        });
        this.socketHelper.onPlayerDelete((player: PlayerInfo) => {
            if (player.nickname !== this.userNickname) {
                if (player.nickname in this.allPlayers) {
                    this.allPlayers[player.nickname].sprite.destroy();
                    delete this.allPlayers[player.nickname];
                }
            }
        });

        // this.socketHelper.onPlayerMoved((serveredPlayers: PlayerInfoDictionary) => {
        //     for (let otherPlayerNickname in serveredPlayers) {
        //         if (otherPlayerNickname !== this.userNickname) {
        //             if (otherPlayerNickname in this.allPlayers) {
        //                 this.allPlayers[otherPlayerNickname].sprite.x = serveredPlayers[otherPlayerNickname].x;
        //                 this.allPlayers[otherPlayerNickname].sprite.y = serveredPlayers[otherPlayerNickname].y;
        //             }
        //             else {
        //                 // You should define createPlayer method in each scene
        //                 this.createPlayer(serveredPlayers[otherPlayerNickname]);
        //             }
        //         }
        //     }
        // });
    }

    createPlayer(playerInfo: PlayerInfo) {
        throw new Error("You should implement createPlayer method in each scene.");
    }
    createAnimation(characterImageKey: string,
        frameInfo: {
            down: { start: number, end: number },
            left: { start: number, end: number },
            right: { start: number, end: number },
            up: { start: number, end: number }
        }) {
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.down.start, end: frameInfo.down.end }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.left.start, end: frameInfo.left.end }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.right.start, end: frameInfo.right.end }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(characterImageKey, { start: frameInfo.up.start, end: frameInfo.up.end }),
            frameRate: 10,
            repeat: -1
        });
    }
}

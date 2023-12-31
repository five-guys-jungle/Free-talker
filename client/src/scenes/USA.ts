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
import {
    TalkingZone
} from "../characters/TalkingZone";

// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";
import {
    openNPCDialog,
    openAirport,
    openUserDialog,
    openFreedialog,
    openReport,
    GAME_STATUS,
    openUSA,
} from "../stores/gameSlice";
import { npcInfo } from "../characters/Npc";
import { appendMessage, clearMessages } from "../stores/talkBoxSlice";
import { appendCorrection, clearCorrections } from "../stores/reportSlice";
import { setScore } from "../stores/scoreSlice";
import {
    appendSentence,
    clearSentences,
    setCanRequestRecommend,
    updateAudioUrl
} from "../stores/sentenceBoxSlice";
import { setRecord, setMessage, setMessageColor } from "../stores/recordSlice";
import { reportOn, reportOff } from "../stores/reportOnoffSlice";
import { handleScene } from "./common/handleScene";
import { RootState } from "../stores/index";

import dotenv from "dotenv";
import Report from "../components/Report";
import {
    setSocketNamespace,
    appendSocketNamespace,
} from "../stores/socketSlice";
import { Pause } from "@material-ui/icons";
import { setText } from "../stores/translationSlice";

const serverUrl: string = process.env.REACT_APP_SERVER_URL!;

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

export default class USAScene extends Phaser.Scene {
    background!: Phaser.GameObjects.Image;
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    offset_x: number = 480;
    offset_y: number = 320;
    initial_x: number = 1850 - this.offset_x;
    initial_y: number = 800 - this.offset_y;
    allPlayers: PlayerDictionary = {};
    recorder: MediaRecorder | null = null;
    socket: Socket | null = null;

    playerId: string = "";
    userNickname: string = "";
    playerTexture: string = "";
    level: string = "intermediate";

    userText: Phaser.GameObjects.Text | null = null;
    npcText: Phaser.GameObjects.Text | null = null;
    socket2: Socket | null = null;
    interacting: boolean = false;
    recorder2: MediaRecorder | null = null;
    seatEvent: number = 0;
    isAudioPlaying: boolean = false;
    isAudioTransfered: boolean = false;
    isNpcSocketConnected: boolean = false;
    npcList: npcInfo[] = [];
    alreadyRecommended: boolean = false;
    speed: number = 200;
    dashSpeed: number = 400;
    tilemapLayerList: Phaser.Tilemaps.TilemapLayer[] = [];
    currNpcName: string = "";
    beforeSleepX: number = this.initial_x;
    beforeSleepY: number = this.initial_y;
    interactionSprite: Phaser.Physics.Arcade.Sprite | null = null;
    interactionSpriteE: Phaser.Physics.Arcade.Sprite | null = null;
    audio: HTMLAudioElement | null = null;
    isReportOn: boolean = false;
    tweenDict: { [key: string]: Phaser.Tweens.Tween[] } = {};
    nowTween: Phaser.Tweens.Tween | null = null;
    nowAnims: string = "";
    beforeDisconnectX: number | null = null;
    beforeDisconnectY: number | null = null;

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
        this.level = data.level;
        console.log("Scene Change, data: ", data);
    }


    gamePause(pausedX: number, pausedY: number) {
        console.log("Scene is Paused: USA");
        // this.intervalId = setInterval(() => {
        //     this.socket!.emit('heartbeat');
        // }, 5000);
    }
    gameResume(pausedX: number, pausedY: number) {
        console.log("Scene is Resumed: USA");
        console.log("allPlayer in Resumed: ", this.allPlayers);
        console.log("this.socket in Resumed: ", this.socket);
        // if(this.intervalId){
        //     clearInterval(this.intervalId);
        //     this.intervalId = null;
        // }
    }
    onSceneWake() {
        console.log("Scene has been woken up!, scene: USA");
        this.socket?.disconnect();
        this.socket = null;
        for (let socketId in this.allPlayers) {
            this.allPlayers[socketId].textObj?.destroy();
            this.allPlayers[socketId].sprite.destroy();
            delete this.allPlayers[socketId];
        }
        this.player1 = null;
        this.gameSocketEventHandler(false);
    }

    onSceneSleep() {
        console.log("Scene is now asleep!, scene: USA");
        this.socket?.disconnect();
        this.socket = null;
        this.beforeSleepX = this.player1 ? this.player1!.x : this.initial_x;
        this.beforeSleepY = this.player1 ? this.player1!.y : this.initial_y;
        for (let socketId in this.allPlayers) {
            this.allPlayers[socketId].textObj?.destroy();
            this.allPlayers[socketId].sprite.destroy();
            delete this.allPlayers[socketId];
        }
        this.player1 = null;
    }

    create() {
        this.background = this.add
            .image(this.initial_x, this.initial_y * 2, "background")
            .setDisplaySize(this.cameras.main.width * 2, this.cameras.main.height * 6)
            .setOrigin(0.5, 0.5);
        this.game.events.on('pause', this.gamePause);
        this.events.on("wake", this.onSceneWake, this);
        this.events.on("sleep", this.onSceneSleep, this);
        // this.add.image(400, 300, "background");
        // 배경 설정
        const map1 = this.make.tilemap({ key: "map1" });
        // console.log(map1);
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
        const logo = map1.createLayer("logo/logo", tileset_logo)!;

        const exteriors_2 = map1.createLayer(
            "layer2/Exteriors",
            tileset_exteriors
        )!;
        const exteriors_3 = map1.createLayer(
            "layer3/Exteriors",
            tileset_exteriors
        )!;

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

        this.tilemapLayerList.push(roombuilder_1);
        this.tilemapLayerList.push(roombuilder_2);
        this.tilemapLayerList.push(exteriors_1);
        this.tilemapLayerList.push(exteriors_2);
        this.tilemapLayerList.push(exteriors_3);
        this.tilemapLayerList.push(interiors_11);
        this.tilemapLayerList.push(interiors_12);
        this.tilemapLayerList.push(interiors_13);
        this.tilemapLayerList.push(interiors_14);
        this.tilemapLayerList.push(interiors_22);
        this.tilemapLayerList.push(interiors_23);
        this.tilemapLayerList.push(interiors_24);
        this.tilemapLayerList.push(interiors_32);
        this.tilemapLayerList.push(interiors_33);

        let USA_talkingzone: TalkingZone = {
            "couch_park1": {
                first_seat: { x: 847, y: 1272 },
                second_seat: { x: 847, y: 1243 }
            },
            "couch_park2": {
                first_seat: { x: 847, y: 913 },
                second_seat: { x: 847, y: 889 }
            },
            "couch_park3": {
                first_seat: { x: 1667, y: 795 },
                second_seat: { x: 1727, y: 795 }
            },
            "couch_park4": {
                first_seat: { x: 1048, y: 795 },
                second_seat: { x: 1108, y: 795 }
            },
            "couch_park5": {
                first_seat: { x: 713, y: 1916 },
                second_seat: { x: 773, y: 1916 }
            },
            "couch_park6": {
                first_seat: { x: 374, y: 1916 },
                second_seat: { x: 434, y: 1916 }
            },
            "couch_park7": {
                first_seat: { x: 72, y: 1916 },
                second_seat: { x: 132, y: 1916 }
            },
            "Mart": {
                first_seat: { x: 2103, y: 1042 },
                second_seat: { x: 2143, y: 1042 }
            },
            "Restaurant": {
                first_seat: { x: 2134, y: 330 },
                second_seat: { x: 2224, y: 330 }
            },
            "Cafe": {
                first_seat: { x: 1170, y: 365 },
                second_seat: { x: 1245, y: 365 }
            },
            "Cafe2": {
                first_seat: { x: 1413, y: 365 },
                second_seat: { x: 1488, y: 365 }
            },

        }
        // createCharacterAnims(this.anims);
        if (this.socket) {
            this.socket.disconnect();
        }
        this.gameSocketEventHandler();
        this.interactionSprite = this.physics.add.sprite(0, 0, "arrowDown");
        this.interactionSprite.setVisible(false);
        this.interactionSprite.setScale(1.3);
        this.interactionSprite.setDepth(100);

        this.interactionSpriteE = this.physics.add.sprite(0, 0, "E_keyboard");
        this.interactionSpriteE.setVisible(false);
        this.interactionSpriteE.setScale(0.5);
        this.interactionSpriteE.setDepth(100);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.interactText = this.add.text(10, 10, "", {
            color: "black",
            fontSize: "16px",
        });
        this.userIdText = this.add.text(10, 10, this.userNickname, {
            color: "black",
            fontSize: "16px",
            stroke: "black",
            strokeThickness: 0.5,
        });
        this.userIdText!.setOrigin(0.5, 0);
        this.userIdText!.setPadding({ top: 10, bottom: 10 })

        let valve_E = true;
        // npc 와의 대화를 위한 키 설정
        let countUserSpeech: number;
        const addCountUserSpeech = () => {
            countUserSpeech++;
            // console.log("User Speech Count: ", countUserSpeech);
        };
        let grammarCorrections: { userText: string; correctedText: string }[] =
            [];
        const processGrammarCorrection = (data: {
            userText: string;
            correctedText: string;
        }) => {
            console.log("grammarCorrection event data: ", data);
            grammarCorrections.push(data);
        };
        window.addEventListener('reportClose', () => {
            // console.log("reportClose event listener");
            this.isReportOn = false;
        });

        window.addEventListener('levelChanged', (event) => {
            if (this.level === "intermediate") {
                this.level = "advanced";
                // store.dispatch(changeLevel())
            } else if (this.level === "advanced") {
                this.level = "beginner";
                // store.dispatch(changeLevel())
            } else if (this.level === "beginner") {
                this.level = "intermediate";
            }
            // console.log(`level : ${this.level}`);
        });


        this.input.keyboard!.on("keydown-E", async () => {
            this.player1!.setVelocity(0, 0);
            if (this.player1 === null || this.player1 === undefined) {
                return;
            }
            for (let npcInfo of this.npcList) {
                // console.log("E-keydown ");
                if (
                    Phaser.Math.Distance.Between(
                        this.player1!.x,
                        this.player1!.y,
                        npcInfo.x,
                        npcInfo.y
                    ) < 100
                ) {
                    this.player1!.setVelocity(0, 0);
                    // console.log("npcInfo: ", npcInfo);
                    if (npcInfo.role === "freeTalkingPlace") {
                        console.log("chair");

                        if (valve_E === true) {
                            store.dispatch(
                                setSocketNamespace({
                                    socketNamespace: `${serverUrl}/freedialog/${npcInfo.name}`,
                                    // socketNamespace: `${serverUrl}/userdialog/${npcInfo.name}`,
                                })
                            );
                            // store.dispatch(appendSocketNamespace({ socketNamespace: `/freedialog` }));
                            store.dispatch(openFreedialog());
                            // store.dispatch(openUserDialog());
                            this.cursors!.left.enabled = false;
                            this.cursors!.right.enabled = false;
                            this.cursors!.up.enabled = false;
                            this.cursors!.down.enabled = false;
                            valve_E = false;
                            window.addEventListener("seat", (event: any) => {
                                // console.log("event.detail: ", event.detail);
                                // console.log("seat event listener");
                                if (event.detail.place_name === "couch_park1" || event.detail.place_name === "couch_park2") {
                                    this.player1!.anims.play(
                                        `${this.player1!.texture.key}_sit_left`,
                                        true
                                    );
                                    this.allPlayers[this.socket!.id].seat = 1;
                                    this.seatEvent = 1;
                                }


                                else {
                                    this.player1!.anims.play(
                                        `${this.player1!.texture.key}_idle_down`,
                                        true
                                    );
                                    this.allPlayers[this.socket!.id].seat = 2;
                                    this.seatEvent = 2;
                                }


                                if (event.detail.seat_position === 1) {


                                    this.allPlayers[this.socket!.id].x = USA_talkingzone[event.detail.place_name].first_seat.x;
                                    this.allPlayers[this.socket!.id].y = USA_talkingzone[event.detail.place_name].first_seat.y;
                                    this.player1!.setPosition(USA_talkingzone[event.detail.place_name].first_seat.x, USA_talkingzone[event.detail.place_name].first_seat.y);
                                }
                                else if (event.detail.seat_position === 2) {

                                    this.allPlayers[this.socket!.id].x = USA_talkingzone[event.detail.place_name].second_seat.x;
                                    this.allPlayers[this.socket!.id].y = USA_talkingzone[event.detail.place_name].second_seat.y;
                                    this.player1!.setPosition(USA_talkingzone[event.detail.place_name].second_seat.x, USA_talkingzone[event.detail.place_name].second_seat.y);
                                }


                            }, false);

                            window.addEventListener("exitcall", (e: Event) => {
                                // console.log("exitcall event listener");
                                this.player1!.setVelocity(0, 0);
                                this.player1!.setPosition(
                                    this.player1!.x,
                                    this.player1!.y
                                );

                                this.cursors!.left.isDown = false;
                                this.cursors!.right.isDown = false;
                                this.cursors!.up.isDown = false;
                                this.cursors!.down.isDown = false;

                                this.cursors!.left.enabled = true;
                                this.cursors!.right.enabled = true;
                                this.cursors!.up.enabled = true;
                                this.cursors!.down.enabled = true;


                                valve_E = true;
                                this.allPlayers[this.socket!.id].seat = 0;
                                this.seatEvent = 3;
                                store.dispatch(openUSA());
                            });
                            window.addEventListener("roomfull", (e: Event) => {
                                // console.log("roomfull event listener");
                                const camera = this.cameras.main;
                                const messageText = '이미 다른 플레이가 이용중입니다';
                                const message = this.add.text(0, 0, messageText, { color: 'e', fontSize: '20px' });
                                message.setOrigin(0.5, 0.5);

                                const padding = 10;  // 텍스트 주변에 더할 패딩 크기
                                const boxWidth = message.width + (2 * padding);
                                const boxHeight = message.height + (2 * padding);

                                const box = this.add.rectangle(0, 0, boxWidth, boxHeight, 0xA7EEFF);  // 하늘색 배경 박스
                                box.setOrigin(0.5, 0.5);

                                // 배경 박스를 텍스트 아래에 두기
                                message.setDepth(1);
                                box.setDepth(0);

                                const container = this.add.container(camera.scrollX + camera.width / 2, camera.scrollY + camera.height / 2, [box, message]);

                                setTimeout(() => {
                                    container.destroy();
                                }, 2000);


                            });
                        } else {
                            this.player1!.setVelocity(0, 0);
                            this.player1!.setPosition(
                                this.player1!.x,
                                this.player1!.y
                            );

                            this.cursors!.left.isDown = false;
                            this.cursors!.right.isDown = false;
                            this.cursors!.up.isDown = false;
                            this.cursors!.down.isDown = false;

                            this.cursors!.left.enabled = true;
                            this.cursors!.right.enabled = true;
                            this.cursors!.up.enabled = true;
                            this.cursors!.down.enabled = true;


                            valve_E = true;
                            this.allPlayers[this.socket!.id].seat = 0;
                            this.seatEvent = 3;
                            store.dispatch(openUSA());
                        }
                    }


                    else if (npcInfo.role === "rolePlayingPlace") {
                        // console.log("chair");
                        this.player1!.setVelocity(0, 0);
                        if (valve_E === true) {
                            store.dispatch(
                                setSocketNamespace({

                                    socketNamespace: `${serverUrl}/userdialog/${npcInfo.name}`
                                })
                            );
                            // store.dispatch(appendSocketNamespace({ socketNamespace: `/freedialog` }));

                            store.dispatch(openUserDialog());
                            this.cursors!.left.enabled = false;
                            this.cursors!.right.enabled = false;
                            this.cursors!.up.enabled = false;
                            this.cursors!.down.enabled = false;
                            valve_E = false;

                            window.addEventListener("seat", (event: any) => {
                                // console.log("event.detail: ", event.detail);
                                // console.log("seat event listener");
                                if (event.detail.place_name === "Restaurant" || event.detail.place_name === "Cafe" || event.detail.place_name === "Cafe2") {
                                    if (event.detail.seat_position === 1) {
                                        this.player1!.anims.play(
                                            `${this.player1!.texture.key}_sit_left`,
                                            true
                                        );
                                        this.allPlayers[this.socket!.id].seat = 1;
                                        this.seatEvent = 1;
                                    }
                                    else if (event.detail.seat_position === 2) {
                                        this.player1!.anims.play(
                                            `${this.player1!.texture.key}_sit_right`,
                                            true
                                        );
                                        this.allPlayers[this.socket!.id].seat = 4;
                                        this.seatEvent = 4;
                                    }
                                }
                                else {
                                    this.player1!.anims.play(
                                        `${this.player1!.texture.key}_idle_down`,
                                        true
                                    );
                                    this.allPlayers[this.socket!.id].seat = 2;
                                    this.seatEvent = 2;
                                }


                                if (event.detail.seat_position === 1) {


                                    this.allPlayers[this.socket!.id].x = USA_talkingzone[event.detail.place_name].first_seat.x;
                                    this.allPlayers[this.socket!.id].y = USA_talkingzone[event.detail.place_name].first_seat.y;
                                    this.player1!.setPosition(USA_talkingzone[event.detail.place_name].first_seat.x, USA_talkingzone[event.detail.place_name].first_seat.y);
                                }
                                else if (event.detail.seat_position === 2) {

                                    this.allPlayers[this.socket!.id].x = USA_talkingzone[event.detail.place_name].second_seat.x;
                                    this.allPlayers[this.socket!.id].y = USA_talkingzone[event.detail.place_name].second_seat.y;
                                    this.player1!.setPosition(USA_talkingzone[event.detail.place_name].second_seat.x, USA_talkingzone[event.detail.place_name].second_seat.y);
                                }


                            }, false);


                            window.addEventListener("exitcall", (e: Event) => {
                                // console.log("exitcall event listener");
                                this.player1!.setVelocity(0, 0);
                                this.player1!.setPosition(
                                    this.player1!.x,
                                    this.player1!.y
                                );

                                this.cursors!.left.isDown = false;
                                this.cursors!.right.isDown = false;
                                this.cursors!.up.isDown = false;
                                this.cursors!.down.isDown = false;

                                this.cursors!.left.enabled = true;
                                this.cursors!.right.enabled = true;
                                this.cursors!.up.enabled = true;
                                this.cursors!.down.enabled = true;


                                valve_E = true;
                                this.allPlayers[this.socket!.id].seat = 0;
                                this.seatEvent = 3;

                                store.dispatch(openUSA());
                            });

                            window.addEventListener("roomfull", (e: Event) => {
                                console.log("roomfull event listener");
                                const camera = this.cameras.main;
                                const messageText = '이미 다른 플레이가 이용중입니다';
                                const message = this.add.text(0, 0, messageText, { color: 'e', fontSize: '20px' });
                                message.setOrigin(0.5, 0.5);

                                const padding = 10;  // 텍스트 주변에 더할 패딩 크기
                                const boxWidth = message.width + (2 * padding);
                                const boxHeight = message.height + (2 * padding);

                                const box = this.add.rectangle(0, 0, boxWidth, boxHeight, 0xA7EEFF);  // 하늘색 배경 박스
                                box.setOrigin(0.5, 0.5);

                                // 배경 박스를 텍스트 아래에 두기
                                message.setDepth(1);
                                box.setDepth(0);

                                const container = this.add.container(camera.scrollX + camera.width / 2, camera.scrollY + camera.height / 2, [box, message]);

                                setTimeout(() => {
                                    container.destroy();
                                }, 2000);
                            });
                        } else {
                            this.player1!.setVelocity(0, 0);
                            this.player1!.setPosition(
                                this.player1!.x,
                                this.player1!.y
                            );

                            this.cursors!.left.isDown = false;
                            this.cursors!.right.isDown = false;
                            this.cursors!.up.isDown = false;
                            this.cursors!.down.isDown = false;

                            this.cursors!.left.enabled = true;
                            this.cursors!.right.enabled = true;
                            this.cursors!.up.enabled = true;
                            this.cursors!.down.enabled = true;


                            valve_E = true;
                            this.allPlayers[this.socket!.id].seat = 0;
                            this.seatEvent = 3;
                            store.dispatch(openUSA());
                        }
                    } else if (npcInfo.name.includes("gate")) {
                        // console.log("liberty");
                        handleScene(GAME_STATUS.AIRPORT, {
                            playerId: this.playerId,
                            playerNickname: this.userNickname,
                            playerTexture: this.playerTexture,
                            level: this.level
                        });

                        // handleScene(GAME_STATUS.USA, {
                        //     playerId: this.playerId,
                        //     playerNickname: this.userNickname,
                        //     playerTexture: this.playerTexture,
                        //     level: this.level
                        // }
                    } else {

                        if (this.isAudioPlaying) {
                            return;
                        }
                        if (this.isReportOn) {
                            return;
                        }

                        this.player1!.setVelocity(0, 0);
                        this.player1!.anims.play(
                            `${this.player1!.texture.key}_idle_down`,
                            true
                        );
                        store.dispatch(openNPCDialog());

                        this.cursors!.left.enabled = false;
                        this.cursors!.right.enabled = false;
                        this.cursors!.up.enabled = false;
                        this.cursors!.down.enabled = false;

                        if (
                            this.socket2 === null ||
                            this.socket2 === undefined
                        ) {
                            if (npcInfo.moving) {
                                for (let tween of this.tweenDict[npcInfo.name]) {
                                    if (tween.isPlaying()) {
                                        this.nowTween = tween;
                                        this.nowAnims = npcInfo.sprite?.anims.currentAnim?.key!;
                                        npcInfo.sprite!.anims.play(`${npcInfo.texture}_idle_down`, true);
                                        tween.pause();
                                    }
                                }
                            }
                            store.dispatch(reportOff());
                            store.dispatch(setScore({ score: 0 }));
                            store.dispatch(clearCorrections());
                            store.dispatch(clearMessages());
                            store.dispatch(clearSentences());
                            this.socket2 = io(`${serverUrl}/interaction`);
                            this.socket2.on("connect", () => {
                                this.isAudioTransfered = false;
                                const translationEvent = (e: Event) => {
                                    const customEvent = e as CustomEvent;
                                    // console.log("translationEvent, customEvent.detail: ", customEvent.detail.message);
                                    this.socket2!.emit('translation', customEvent.detail.message);
                                };
                                const recommendBtnClicked = (e: Event) => {
                                    const customEvent = e as CustomEvent;
                                    store.dispatch(clearSentences());
                                    if (customEvent.detail.message === 0) {
                                        store.dispatch(
                                            appendSentence({
                                                _id: 3,
                                                sentence:
                                                    "추천 문장을 준비 중입니다. 잠시만 기다려 주세요.",
                                            })
                                        );
                                    }
                                    // console.log(
                                    //     "lastMessage in SectanceBox: ",
                                    //     customEvent.detail.lastMessage
                                    // );
                                    this.socket2!.emit(
                                        "getRecommendedResponses",
                                        this.currNpcName,
                                        this.alreadyRecommended,
                                        customEvent.detail.lastMessage,
                                        this.level
                                    );
                                    store.dispatch(
                                        setCanRequestRecommend(false)
                                    );
                                };

                                const requestTTSEvent = (e: Event) => {
                                    const customEvent = e as CustomEvent;
                                    this.socket2!.emit(
                                        "requestTTS",
                                        customEvent.detail.sentence,
                                        customEvent.detail.id,
                                        this.currNpcName,
                                        this.level);
                                };

                                this.socket2!.on("disconnect", () => {
                                    // console.log("disconnect, recommendBtnClicked: ", recommendBtnClicked);
                                    window.removeEventListener("recomButtonClicked", recommendBtnClicked);
                                    window.removeEventListener("translationEvent", translationEvent);
                                    window.removeEventListener("requestTTS", requestTTSEvent);
                                });
                                this.currNpcName = npcInfo.name;
                                console.log(
                                    "connect, interaction socket.id: ",
                                    this.socket2!.id
                                );
                                countUserSpeech = 0;
                                this.isNpcSocketConnected = true;
                                window.addEventListener(
                                    "recomButtonClicked",
                                    recommendBtnClicked
                                );
                                window.addEventListener(
                                    "translationEvent", translationEvent
                                );
                                window.addEventListener("requestTTS", requestTTSEvent);

                                this.interacting = true;
                                this.socket2!.emit("dialogStart", npcInfo.name, this.level);
                                this.isAudioPlaying = true;
                                this.socket2!.on("translatedText", (translatedText: string) => {
                                    // console.log("translatedText: ", translatedText);
                                    store.dispatch(setText(translatedText));
                                });
                                // TODO : npcFirstResponse 받고, audio 재생하는 동안 E, D키 비활성화 및 '응답중입니다. 잠시만 기다려주세요' 출력
                                this.socket2!.on("npcFirstResponse", (response: any) => {
                                    // console.log("npcFirstResponse event");
                                    store.dispatch(
                                        setMessage(
                                            "응답중입니다\n잠시만 기다려주세요"
                                        )
                                    );
                                    store.dispatch(setCanRequestRecommend(false));
                                    store.dispatch(
                                        appendMessage({
                                            playerId: this.playerId,
                                            name: npcInfo.name,
                                            img: npcInfo.texture,
                                            // img: "",
                                            side: "left",
                                            text: response.assistant,
                                            audioUrl: response.audioUrl
                                        })
                                    );
                                    this.audio = new Audio(
                                        response.audioUrl
                                    );
                                    this.audio.onended = () => {
                                        // console.log("audio.onended");
                                        this.isAudioPlaying = false;
                                        this.isAudioTransfered = false;
                                        store.dispatch(
                                            setMessage(
                                                "D키를 눌러\n녹음을 시작하세요"
                                            )
                                        );
                                        store.dispatch(
                                            setCanRequestRecommend(true)
                                        );
                                    };
                                    this.audio.play();
                                    this.isAudioTransfered = true;
                                })
                                console.log(
                                    "connect, interaction socket.id: ",
                                    this.socket2!.id
                                );
                                this.socket2!.on(
                                    "speechToText",
                                    (response: any) => {
                                        if (
                                            response.transcription === "" ||
                                            response.transcription ===
                                            "convertSpeechToText Error" ||
                                            response.transcription === "chain call error"
                                        ) {
                                            store.dispatch(
                                                setMessage(
                                                    "다시 말씀해주세요"
                                                )
                                            );
                                            store.dispatch(
                                                setMessageColor("red")
                                            );
                                            setTimeout(() => {
                                                store.dispatch(
                                                    setMessage(
                                                        "D키를 눌러\n녹음을 시작하세요"
                                                    )
                                                );
                                                store.dispatch(
                                                    setMessageColor("black")
                                                );
                                            }, 2500);
                                            store.dispatch(
                                                setCanRequestRecommend(
                                                    false
                                                )
                                            );
                                            store.dispatch(setRecord(true));
                                            this.isAudioPlaying = false;
                                        } else {
                                            addCountUserSpeech();
                                            // console.log("USER: ", response.transcription);
                                            // console.log(
                                            //     "playerTexture",
                                            //     this.playerTexture
                                            // );
                                            store.dispatch(
                                                appendMessage({
                                                    playerId: this.playerId,
                                                    name: this.userNickname,
                                                    img: this.playerTexture,
                                                    // img: "",
                                                    side: "right",
                                                    text: response.transcription,
                                                    audioUrl: response.audioUrl
                                                })
                                            );
                                            store.dispatch(clearSentences());
                                            this.alreadyRecommended = false;
                                        }
                                    }
                                );
                                // this.socket2!.on(
                                //     "npcResponse",
                                //     (response: string) => {
                                //         console.log("NPC: ", response);
                                //         store.dispatch(
                                //             appendMessage({
                                //                 playerId: this.playerId,
                                //                 name: npcInfo.name,
                                //                 img: npcInfo.texture,
                                //                 // img: "",
                                //                 side: "left",
                                //                 text: response,
                                //             })
                                //         );
                                //         store.dispatch(clearSentences());
                                //         this.alreadyRecommended = false;
                                //     }
                                // );
                                this.socket2!.on(
                                    "totalResponse",
                                    (response: any) => {
                                        // console.log(
                                        //     "totalResponse event response: ",
                                        //     response
                                        // );

                                        // console.log("NPC: ", response.assistant);
                                        store.dispatch(
                                            appendMessage({
                                                playerId: this.playerId,
                                                name: npcInfo.name,
                                                img: npcInfo.texture,
                                                // img: "",
                                                side: "left",
                                                text: response.assistant,
                                                audioUrl: response.audioUrl
                                            })
                                        );
                                        store.dispatch(clearSentences());
                                        this.alreadyRecommended = false;
                                        // this.isAudioPlaying = true;
                                        this.audio = new Audio(
                                            response.audioUrl
                                        );
                                        this.audio.onended = () => {
                                            console.log("audio.onended");
                                            this.isAudioPlaying = false;
                                            this.isAudioTransfered = false;
                                            store.dispatch(
                                                setMessage(
                                                    "D키를 눌러\n녹음을 시작하세요"
                                                )
                                            );
                                            store.dispatch(
                                                setCanRequestRecommend(true)
                                            );
                                        };
                                        this.audio.play();
                                        this.isAudioTransfered = true;
                                    }
                                );

                                this.socket2!.on(
                                    "grammarCorrection",
                                    processGrammarCorrection
                                );
                                this.socket2!.on(
                                    "recommendedResponses",
                                    (responses: string[]) => {
                                        console.log(
                                            "Recommended Responses: ",
                                            responses
                                        );
                                        // 요청 실패, 재요청
                                        if (responses.length === 1) {
                                            console.log(
                                                "요청 실패, 재요청"
                                            );
                                            this.alreadyRecommended = false;
                                            this.socket2!.emit(
                                                "getRecommendedResponses",
                                                this.currNpcName,
                                                this.alreadyRecommended,
                                                responses[0],
                                                this.level
                                            );
                                            store.dispatch(
                                                setCanRequestRecommend(
                                                    false
                                                )
                                            );
                                            return;
                                        }
                                        // TODO : Store에 SentenceBox 상태정의하고 dispatch
                                        store.dispatch(clearSentences());
                                        responses.forEach(
                                            (response, index) => {
                                                store.dispatch(
                                                    appendSentence({
                                                        _id: index,
                                                        sentence: response,
                                                    })
                                                );
                                            }
                                        );
                                        this.alreadyRecommended = true;
                                    }
                                );
                                this.socket2!.on(
                                    "responseTTS", (data: { user: string, assitant: string, audioUrl: string, id: number }) => {


                                        // If found, update its audio URL in the Redux store
                                        // console.log(`index: ${data.id}`);
                                        // console.log(`responseTTS: audioUrl: ${data.audioUrl}`);
                                        store.dispatch(updateAudioUrl({ index: data.id, audioUrl: data.audioUrl }));
                                        // console.log("responseTTS, dispatch event called!!");

                                    }
                                );
                            });
                        } else {
                            this.isAudioTransfered = false;
                            // 이미 소켓이 연결되어 있는데 다시 한번 E키를 누른 경우 -> 대화 종료 상황
                            if (npcInfo.moving) {
                                npcInfo.sprite!.anims.resume();
                                npcInfo.sprite!.anims.play(this.nowAnims, true);
                                this.nowTween?.resume();
                                this.nowTween = null;
                            }

                            this.currNpcName = "";
                            this.isNpcSocketConnected = false;
                            this.player1!.setVelocity(0, 0);
                            this.player1!.setPosition(
                                this.player1!.x,
                                this.player1!.y
                            );

                            this.cursors!.left.isDown = false;
                            this.cursors!.right.isDown = false;
                            this.cursors!.up.isDown = false;
                            this.cursors!.down.isDown = false;

                            this.cursors!.left.enabled = true;
                            this.cursors!.right.enabled = true;
                            this.cursors!.up.enabled = true;
                            this.cursors!.down.enabled = true;

                            this.interacting = false;
                            this.alreadyRecommended = false;
                            store.dispatch(setCanRequestRecommend(false));

                            this.socket2?.disconnect();
                            this.socket2 = null;
                            // store.dispatch(clearMessages());
                            // store.dispatch(openAirport());
                            let score = 0;
                            if (countUserSpeech !== 0) {
                                score = ((countUserSpeech - grammarCorrections.length) /
                                    countUserSpeech) * 100;
                            }
                            // console.log("score : ", score);
                            store.dispatch(setScore({ score: score }));
                            grammarCorrections.forEach((data, index) => {
                                // console.log(
                                //     "grammarCorrection data: ",
                                //     data
                                // );
                                store.dispatch(
                                    appendCorrection({
                                        original: data.userText,
                                        correction: data.correctedText,
                                    })
                                );
                            });

                            this.isReportOn = true;
                            store.dispatch(openReport());
                            store.dispatch(reportOn("usa"));
                            grammarCorrections = [];
                        }

                        countUserSpeech = 0;

                    }
                    break;
                }
            }
        });
        // 녹음 데이터를 보내고 응답을 받는 키 설정
        this.input.keyboard!.on("keydown-D", async () => {
            if (!this.isNpcSocketConnected) {
                console.log("NPC와 연결되지 않았습니다.");
                return;
            }
            if (this.isAudioPlaying) {
                return;
            }
            for (let npcInfo of this.npcList) {
                if (
                    Phaser.Math.Distance.Between(
                        this.player1!.x,
                        this.player1!.y,
                        npcInfo.x,
                        npcInfo.y
                    ) < 100 &&
                    this.socket2?.connected
                ) {
                    console.log("R key pressed");

                    if (
                        this.recorder2 === null ||
                        this.recorder2 === undefined
                    ) {
                        await this.recordEventHandler().then(() => {
                            // console.log("recordEventHandler finished");
                        });
                    }

                    if (this.recorder2) {
                        if (this.recorder2.state === "recording") {
                            store.dispatch(setRecord(true));
                            store.dispatch(
                                setMessage("D키를 눌러\n녹음을 시작하세요")
                            );
                            this.isAudioPlaying = true;
                            this.recorder2!.stop();
                        } else {
                            store.dispatch(setCanRequestRecommend(false));
                            store.dispatch(setRecord(false));
                            store.dispatch(
                                setMessage(
                                    "녹음 중입니다\nD키를 눌러 녹음을 종료하세요"
                                )
                            );
                            this.recorder2!.start();
                        }
                    }

                    break;
                }
            }
        });
        // NPC의 음성 재생을 스킵하는 기능
        this.input.keyboard!.on("keydown-S", async () => {
            console.log("S key pressed, isAudioPlaying: ", this.isAudioPlaying);
            if (this.isAudioPlaying && this.isAudioTransfered) {
                this.audio?.pause();
                this.isAudioPlaying = false;
                this.isAudioTransfered = false;
                store.dispatch(setMessage("D키를 눌러\n녹음을 시작하세요"));
                store.dispatch(setCanRequestRecommend(true));
                this.audio = new Audio();
                this.audio = null
            }
        });
    }
    playInteractionAnims() {
        for (let npcInfo of this.npcList) {
            if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y, npcInfo.x, npcInfo.y) < 100) {
                if (npcInfo.name === 'Mart' || npcInfo.name === 'coach_park' || npcInfo.name === 'Cafe' || npcInfo.name === 'Cafe2') {
                    return;
                }
                this.interactionSprite?.setPosition(npcInfo.x, npcInfo.y - 50);
                this.interactionSprite?.setVisible(true);
                this.interactionSprite?.play('arrowDownAnim', true);

                this.interactionSpriteE?.setPosition(npcInfo.x + 30, npcInfo.y - 50);
                this.interactionSpriteE?.setVisible(true);
                break;
            } else {
                this.interactionSprite?.setVisible(false);
                this.interactionSpriteE?.setVisible(false);
            }
        }
    }
    update(time: number, delta: number) {
        this.background
            .setDisplaySize(this.cameras.main.width * 4, this.cameras.main.height * 6)
            .setOrigin(0.5, 0.5);

        let speed: number = this.cursors?.shift.isDown
            ? this.dashSpeed
            : this.speed;
        let velocityX = 0;
        let velocityY = 0;

        if (this.player1 !== null && this.player1 !== undefined) {
            this.playInteractionAnims();
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
                if (this.player1.anims.isPlaying) {
                    let idle_anims: string =
                        this.player1!.anims.currentAnim!.key;
                    idle_anims = idle_anims.replace("run", "idle");
                    this.player1!.anims.play(idle_anims, true);
                }
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
                    seat: this.allPlayers[this.socket!.id].seat,
                });
            }

            if (this.seatEvent) {
                console.log("seatEvent");
                this.socket!.emit("seat",
                    {
                        socketId: this.socket!.id,
                        nickname: this.allPlayers[this.socket!.id].nickname,
                        playerTexture: this.allPlayers[this.socket!.id].playerTexture,
                        x: this.allPlayers[this.socket!.id].x,
                        y: this.allPlayers[this.socket!.id].y,
                        scene: this.allPlayers[this.socket!.id].scene,
                        dash: this.allPlayers[this.socket!.id].dash,
                        seat: this.allPlayers[this.socket!.id].seat,
                    },
                    this.seatEvent = 0
                )
            }

            this.socket!.on("otherseat", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene == "USAScene") {
                    this.allPlayers[playerInfo.socketId].seat = playerInfo.seat;
                    this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                    this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                    // console.log("otherseat", playerInfo);
                    this.allPlayers[playerInfo.socketId].sprite!.setX(playerInfo.x);
                    this.allPlayers[playerInfo.socketId].sprite!.setY(playerInfo.y);

                }
            });

            for (let key in this.allPlayers) {
                if (key !== this.socket.id) {
                    let deltaInSecond: number = delta / 1000;
                    let otherPlayer: Player = this.allPlayers[key];
                    otherPlayer.move(deltaInSecond);
                    this.allPlayers[key].moveText(this);
                }
            }
        }
        for (let movingNpc of this.npcList) {
            // console.log("movingNpc(x, y): ", movingNpc.sprite!.x, movingNpc.sprite!.y);
            if (movingNpc.moving) {
                movingNpc.x = movingNpc.sprite!.x;
                movingNpc.y = movingNpc.sprite!.y;
            }
        }

    }

    createPlayer(playerInfo: PlayerInfo): Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'
        let playerSprite = this.physics.add
            .sprite(playerInfo.x, playerInfo.y, playerInfo.playerTexture)
            .setDepth(2);

        // Create a new player instance
        const newPlayer = new Player(
            playerInfo.socketId,
            playerInfo.nickname,
            playerInfo.playerTexture,
            playerSprite,
            playerInfo.x,
            playerInfo.y,
            playerInfo.scene,
        );

        // Add the sprite to the Phaser scene
        this.allPlayers[playerInfo.socketId] = newPlayer;
        return playerSprite;
    }
    async recordEventHandler() {
        await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                if (this.recorder2 === null || this.recorder2 === undefined) {
                    this.recorder2 = new MediaRecorder(stream, { audioBitsPerSecond: 128000 });
                }

                this.recorder2.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                this.recorder2.onstop = () => {
                    const blob: Blob = new Blob(chunks, { type: "audio/wav" });
                    chunks = [];
                    blob.arrayBuffer().then((buffer) => {
                        console.log("buffer: ", buffer);
                        store.dispatch(
                            setMessage("응답 중입니다\n잠시만 기다려주세요")
                        );
                        this.socket2!.emit("audioSend", {
                            userNickname: this.userNickname,
                            npcName: this.currNpcName, // TODO: npc 이름 받아오기
                            audioDataBuffer: buffer,
                            level: this.level,
                        });
                    });
                };
            })
            .catch((error) => {
                console.log(error);
            });
    }
    createUSANpc() {
        let gate: npcInfo = {
            name: "gate",
            x: this.initial_x,
            y: this.initial_y + 50,
            texture: "gate",
            sprite: null,
            role: "npc",
            moving: false,
        };
        gate.sprite = this.physics.add.sprite(gate.x, gate.y, gate.texture);
        gate.sprite.alpha = 0;
        gate.sprite.setScale(0.35);
        this.npcList.push(gate);

        this.physics.add.sprite(1819 - this.offset_x, 1200 - this.offset_y, "statueOfLiberty").setDepth(3);

        let npc1: npcInfo = {
            name: "HotelReceptionist",
            x: 650 - this.offset_x,
            y: 1632 - this.offset_y,
            texture: "HotelReceptionist",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc1.sprite = this.physics.add.sprite(npc1.x, npc1.y, npc1.texture);
        this.npcList.push(npc1);

        let npc2: npcInfo = {
            name: "Barista",
            x: 1810 - this.offset_x,
            y: 428 - this.offset_y,
            texture: "Barista",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc2.sprite = this.physics.add.sprite(npc2.x, npc2.y, npc2.texture);
        this.npcList.push(npc2);

        let npc3: npcInfo = {
            name: "Doctor",
            x: 1741 - this.offset_x,
            y: 2413 - this.offset_y,
            texture: "Doctor",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc3.sprite = this.physics.add.sprite(npc3.x, npc3.y, npc3.texture);
        this.npcList.push(npc3);

        let npc4: npcInfo = {
            name: "Nurse",
            x: 1741 - this.offset_x,
            y: 2213 - this.offset_y,
            texture: "Nurse",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc4.sprite = this.physics.add
            .sprite(npc4.x, npc4.y, npc4.texture)
            .setDepth(1);
        this.npcList.push(npc4);

        let npc5: npcInfo = {
            name: "ClothingShopStaff",
            x: 3102 - this.offset_x,
            y: 2237 - this.offset_y,
            texture: "ClothingShopStaff",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc5.sprite = this.physics.add.sprite(npc5.x, npc5.y, npc5.texture);
        this.npcList.push(npc5);

        let npc6: npcInfo = {
            name: "MartCashier",
            x: 2739 - this.offset_x,
            y: 1842 - this.offset_y,
            texture: "MartCashier",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc6.sprite = this.physics.add.sprite(npc6.x, npc6.y, npc6.texture);
        this.npcList.push(npc6);

        let npc7: npcInfo = {
            name: "Chef",
            x: 3216 - this.offset_x,
            y: 417 - this.offset_y,
            texture: "Chef",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc7.sprite = this.physics.add.sprite(npc7.x, npc7.y, npc7.texture);
        this.npcList.push(npc7);
        let npc8: npcInfo = {
            name: "Waitress",
            x: 2928 - this.offset_x,
            y: 432 - this.offset_y,
            texture: "Waitress",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc8.sprite = this.physics.add.sprite(npc8.x, npc8.y, npc8.texture);
        this.npcList.push(npc8);

        // //moving npc-----------------------------------------------------------------------------
        // let npc9: npcInfo = {
        //     name: "Minsook",
        //     x: 1155,
        //     y: 859,
        //     texture: "minsook",
        //     sprite: null,
        //     role: "npc",
        //     moving: true,
        // };
        // npc9.sprite = this.physics.add.sprite(npc9.x, npc9.y, npc9.texture);
        // this.npcList.push(npc9);

        // let points = [
        //     { x: 1594, y: 887, anim: `${npc9.texture}_run_right` },
        //     { x: 1155, y: 859, anim: `${npc9.texture}_run_left` },
        // ];

        // let tweens = points.map((point, index) =>
        //     this.tweens.add({
        //         targets: npc9.sprite,
        //         x: point.x,
        //         y: point.y,
        //         ease: 'Linear',
        //         duration: 5000,
        //         repeat: -1,
        //         onStart: () => {
        //             npc9.sprite!.anims.play(point.anim);
        //             // console.log("start, anim: ", point.anim);
        //         },
        //         onComplete: () => {
        //             console.log("complete");
        //         },
        //         onRepeat: () => {
        //             console.log("repeat");
        //             npc9.sprite!.anims.play(points[(index + 1) % points.length].anim, true);
        //             // console.log("repeat, anim: ", points[(index+1)%points.length].anim);
        //         },
        //         paused: index !== 0, // Only pause the animations that are not the first one
        //     }));
        // this.tweenDict[npc9.name] = tweens;

        // for (let i = 0; i < tweens.length; i++) {
        //     tweens[i].on('repeat', () => {
        //         tweens[i].pause();
        //         let nextTween = tweens[(i + 1) % tweens.length];
        //         nextTween.resume(); // Resume the next animation
        //     })
        // }

        // tweens[0].resume(); // Start the first animation
        // //-----------------------------------------------------------------------------
        //moving npc-----------------------------------------------------------------------------
        let npc10: npcInfo = {
            name: "Doyoungboy",
            x: 202,
            y: 336,
            texture: "doyoungboy",
            sprite: null,
            role: "npc",
            moving: true,
        };
        npc10.sprite = this.physics.add.sprite(npc10.x, npc10.y, npc10.texture);
        this.npcList.push(npc10);

        let points2 = [
            { x: 386, y: 480, anim: `${npc10.texture}_run_down` },
            { x: 500, y: 370, anim: `${npc10.texture}_run_right` },
            { x: 507, y: 660, anim: `${npc10.texture}_run_down` },
            { x: 253, y: 530, anim: `${npc10.texture}_run_left` },
            { x: 202, y: 336, anim: `${npc10.texture}_run_up` },
        ];

        let tweens2 = points2.map((point, index) =>
            this.tweens.add({
                targets: npc10.sprite,
                x: point.x,
                y: point.y,
                ease: 'Linear',
                duration: 5000,
                repeat: -1,
                onStart: () => {
                    npc10.sprite!.anims.play(point.anim);
                    // console.log("start, anim: ", point.anim);
                },
                onComplete: () => {
                    console.log("complete");
                },
                onRepeat: () => {
                    // console.log("repeat");
                    npc10.sprite!.anims.play(points2[(index + 1) % points2.length].anim, true);
                    // console.log("repeat, anim: ", points[(index+1)%points.length].anim);
                },
                paused: index !== 0, // Only pause the animations that are not the first one
            }));
        this.tweenDict[npc10.name] = tweens2;

        for (let i = 0; i < tweens2.length; i++) {
            tweens2[i].on('repeat', () => {
                tweens2[i].pause();
                let nextTween = tweens2[(i + 1) % tweens2.length];
                nextTween.resume(); // Resume the next animation
            })
        }

        tweens2[0].resume(); // Start the first animation
        //-----------------------------------------------------------------------------


        let interact_sprite1: npcInfo = {
            name: "couch_park1",
            x: 848,
            y: 1273,
            texture: "couch_park1",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite1.sprite = this.physics.add.sprite(interact_sprite1.x, interact_sprite1.y, interact_sprite1.texture);
        this.npcList.push(interact_sprite1);

        let interact_sprite2: npcInfo = {
            name: "couch_park2",
            x: 848,
            y: 901,
            texture: "couch_park1",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite2.sprite = this.physics.add.sprite(interact_sprite2.x, interact_sprite2.y, interact_sprite2.texture);
        this.npcList.push(interact_sprite2);

        let interact_sprite3: npcInfo = {
            name: "couch_park3",
            x: 1695,
            y: 795,
            texture: "couch_park2",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite3.sprite = this.physics.add.sprite(interact_sprite3.x, interact_sprite3.y, interact_sprite3.texture);
        this.npcList.push(interact_sprite3);

        let interact_sprite4: npcInfo = {
            name: "couch_park4",
            x: 1078,
            y: 795,
            texture: "couch_park2",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite4.sprite = this.physics.add.sprite(interact_sprite4.x, interact_sprite4.y, interact_sprite4.texture);
        this.npcList.push(interact_sprite4);

        let interact_sprite5: npcInfo = {
            name: "couch_park5",
            x: 743,
            y: 1916,
            texture: "couch_park2",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite5.sprite = this.physics.add.sprite(interact_sprite5.x, interact_sprite5.y, interact_sprite5.texture);
        this.npcList.push(interact_sprite5);

        let interact_sprite6: npcInfo = {
            name: "couch_park6",
            x: 404,
            y: 1916,
            texture: "couch_park2",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite6.sprite = this.physics.add.sprite(interact_sprite6.x, interact_sprite6.y, interact_sprite6.texture);
        this.npcList.push(interact_sprite6);

        let interact_sprite7: npcInfo = {
            name: "couch_park7",
            x: 102,
            y: 1916,
            texture: "couch_park2",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };


        interact_sprite7.sprite = this.physics.add.sprite(interact_sprite7.x, interact_sprite7.y, interact_sprite7.texture);
        this.npcList.push(interact_sprite7);


        let interact_sprite10: npcInfo = {
            name: "Mart",
            x: 2603 - this.offset_x,
            y: 1362 - this.offset_y,
            texture: "Mart",
            sprite: null,
            role: "rolePlayingPlace",
            moving: false,
        };
        interact_sprite10.sprite = this.physics.add.sprite(interact_sprite10.x, interact_sprite10.y, interact_sprite10.texture);
        this.npcList.push(interact_sprite10);

        let interact_sprite11: npcInfo = {
            name: "Restaurant",
            x: 2172,
            y: 360,
            texture: "Restaurant",
            sprite: null,
            role: "rolePlayingPlace",
            moving: false,
        };
        interact_sprite11.sprite = this.physics.add.sprite(interact_sprite11.x, interact_sprite11.y, interact_sprite11.texture);
        this.npcList.push(interact_sprite11);

        let interact_sprite12: npcInfo = {
            name: "Cafe",
            x: 1230,
            y: 380,
            texture: "Cafe",
            sprite: null,
            role: "rolePlayingPlace",
            moving: false,
        };
        interact_sprite12.sprite = this.physics.add.sprite(interact_sprite12.x, interact_sprite12.y, interact_sprite12.texture);
        this.npcList.push(interact_sprite12);

        let interact_sprite13: npcInfo = {
            name: "Cafe2",
            x: 1473,
            y: 380,
            texture: "Cafe",
            sprite: null,
            role: "rolePlayingPlace",
            moving: false,
        };
        interact_sprite13.sprite = this.physics.add.sprite(interact_sprite13.x, interact_sprite13.y, interact_sprite13.texture);
        this.npcList.push(interact_sprite13);

        let interact_sprite8: npcInfo = {
            name: "taxi",
            x: 1361,
            y: 554,
            texture: "taxi",
            sprite: null,
            role: "freeTalkingPlace",
            moving: false,
        };
        interact_sprite8.sprite = this.physics.add.sprite(interact_sprite8.x, interact_sprite8.y, interact_sprite8.texture).setScale(1.5);



        const temp1: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite1.x, interact_sprite1.y - 50, "arrowDown");
        temp1.setVisible(true);
        temp1.setScale(1.3);
        temp1.setDepth(100);
        temp1.play('arrowDownAnim', true);

        const temp21: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite1.x + 30, interact_sprite1.y - 50, "E_keyboard");
        temp21.setVisible(true);
        temp21.setScale(0.5);
        temp21.setDepth(100);


        const temp2: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite2.x, interact_sprite2.y - 50, "arrowDown");
        temp2.setVisible(true);
        temp2.setScale(1.3);
        temp2.setDepth(100);
        temp2.play('arrowDownAnim', true);

        const temp22: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite2.x + 30, interact_sprite2.y - 50, "E_keyboard");
        temp22.setVisible(true);
        temp22.setScale(0.5);
        temp22.setDepth(100);

        const temp3: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite3.x, interact_sprite3.y - 50, "arrowDown");
        temp3.setVisible(true);
        temp3.setScale(1.3);
        temp3.setDepth(100);
        temp3.play('arrowDownAnim', true);

        const temp23: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite3.x + 30, interact_sprite3.y - 50, "E_keyboard");
        temp23.setVisible(true);
        temp23.setScale(0.5);
        temp23.setDepth(100);

        const temp4: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite4.x, interact_sprite4.y - 50, "arrowDown");
        temp4.setVisible(true);
        temp4.setScale(1.3);
        temp4.setDepth(100);
        temp4.play('arrowDownAnim', true);


        const temp24: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite4.x + 30, interact_sprite4.y - 50, "E_keyboard");
        temp24.setVisible(true);
        temp24.setScale(0.5);
        temp24.setDepth(100);

        const temp5: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite5.x, interact_sprite5.y - 50, "arrowDown");
        temp5.setVisible(true);
        temp5.setScale(1.3);
        temp5.setDepth(100);
        temp5.play('arrowDownAnim', true);

        const temp25: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite5.x + 30, interact_sprite5.y - 50, "E_keyboard");
        temp25.setVisible(true);
        temp25.setScale(0.5);
        temp25.setDepth(100);

        const temp6: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite6.x, interact_sprite6.y - 50, "arrowDown");
        temp6.setVisible(true);
        temp6.setScale(1.3);
        temp6.setDepth(100);
        temp6.play('arrowDownAnim', true);

        const temp26: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite6.x + 30, interact_sprite6.y - 50, "E_keyboard");
        temp26.setVisible(true);
        temp26.setScale(0.5);
        temp26.setDepth(100);

        const temp7: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite7.x, interact_sprite7.y - 50, "arrowDown");
        temp7.setVisible(true);
        temp7.setScale(1.3);
        temp7.setDepth(100);
        temp7.play('arrowDownAnim', true);

        const temp27: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite7.x + 30, interact_sprite7.y - 50, "E_keyboard");
        temp27.setVisible(true);
        temp27.setScale(0.5);
        temp27.setDepth(100);

        const temp10: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite10.x, interact_sprite10.y - 50, "arrowDown");
        temp10.setVisible(true);
        temp10.setScale(1.3);
        temp10.setDepth(100);
        temp10.play('arrowDownAnim', true);

        const temp30: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite10.x + 30, interact_sprite10.y - 50, "E_keyboard");
        temp30.setVisible(true);
        temp30.setScale(0.5);
        temp30.setDepth(100);

        const temp11: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite11.x, interact_sprite11.y - 50, "arrowDown");
        temp11.setVisible(true);
        temp11.setScale(1.3);
        temp11.setDepth(100);
        temp11.play('arrowDownAnim', true);

        const temp31: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite11.x + 30, interact_sprite11.y - 50, "E_keyboard");
        temp31.setVisible(true);
        temp31.setScale(0.5);
        temp31.setDepth(100);

        const temp12: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite12.x - 20, interact_sprite12.y - 50, "arrowDown");
        temp12.setVisible(true);
        temp12.setScale(1.3);
        temp12.setDepth(100);
        temp12.play('arrowDownAnim', true);

        const temp32: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite12.x + 10, interact_sprite12.y - 50, "E_keyboard");
        temp32.setVisible(true);
        temp32.setScale(0.5);
        temp32.setDepth(100);

        const temp13: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite13.x - 20, interact_sprite13.y - 50, "arrowDown");
        temp13.setVisible(true);
        temp13.setScale(1.3);
        temp13.setDepth(100);
        temp13.play('arrowDownAnim', true);

        const temp33: Phaser.Physics.Arcade.Sprite = this.physics.add.sprite(interact_sprite13.x + 10, interact_sprite13.y - 50, "E_keyboard");
        temp33.setVisible(true);
        temp33.setScale(0.5);
        temp33.setDepth(100);


    }
    gameSocketEventHandler(initial: boolean = true) {
        this.socket = io(serverUrl);

        this.socket!.on("connect", () => {
            this.socket!.io.on("reconnect_error", (error) => {
                console.log(`reconnect_error, socket id: ${this.socket!.id}`);
            });
            this.socket!.io.on("reconnect_failed", () => {
                window.location.reload();
                console.log(`reconnect_failed, socket id: ${this.socket!.id}`);
            });

            console.log(`connect, socket.id: ${this.socket!.id}, 
            this.socket.recovered: ${this.socket!.recovered}`);
            if (!this.scene.isActive()) {
                this.scene.resume();
            }

            if (this.socket!.recovered) {
                // this.scene.resume();
                //do nothing
            }
            else {
                // if (this.beforeDisconnectX === null && this.beforeDisconnectY === null) {
                this.player1 = this.createPlayer({
                    socketId: this.socket!.id,
                    nickname: this.userNickname,
                    playerTexture: this.playerTexture,
                    x: this.initial_x,
                    y: this.initial_y,
                    scene: "USAScene",
                    dash: false,
                    seat: 0,
                });
                // }
                if (this.beforeDisconnectX !== null && this.beforeDisconnectY !== null) {
                    this.player1!.x = this.beforeDisconnectX;
                    this.player1!.y = this.beforeDisconnectY;
                }
                else {
                    this.player1!.x = this.beforeSleepX;
                    this.player1!.y = this.beforeSleepY;
                }

                this.cameras.main.startFollow(this.player1!);
                this.cameras.main.zoom = 1.2;
            }
            this.socket!.emit("connected", {
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.player1!.x,
                y: this.player1!.y,
                scene: "USAScene",
                dash: false,
            });

            this.socket!.on(
                "updateAlluser",
                (otherPlayers: PlayerInfoDictionary) => {
                    // console.log("updateAlluser, allPlayers: ", otherPlayers);
                    for (let key in otherPlayers) {
                        // console.log("updateAlluser, key: ", key);
                        if (otherPlayers[key].socketId !== this.socket!.id) {
                            if (
                                !(otherPlayers[key].socketId in this.allPlayers)
                            ) {
                                // console.log("updateAlluser, ", otherPlayers);
                                let playerSprite: Phaser.Physics.Arcade.Sprite =
                                    this.createPlayer(otherPlayers[key]);
                                // playerSprite.setCollideWorldBounds(true);
                                if (otherPlayers[key].seat == 1) {
                                    console.log("he is seated")
                                    //     `${otherPlayers[key].playerTexture}_idle_down`;
                                    playerSprite.anims.play(
                                        `${otherPlayers[key].playerTexture}_sit_left`,
                                        true
                                    );
                                } else if (otherPlayers[key].seat == 4) {
                                    console.log("he is seated")
                                    //     `${otherPlayers[key].playerTexture}_idle_down`;
                                    playerSprite.anims.play(
                                        `${otherPlayers[key].playerTexture}_sit_right`,
                                        true
                                    );
                                } else {
                                    // console.log("he is not seated")
                                    playerSprite.anims.play(
                                        `${otherPlayers[key].playerTexture}_idle_down`,
                                        true
                                    );
                                }
                            } else {
                                // console.log(
                                //     "updateAlluser, already exist, so just set position"
                                // );

                                this.allPlayers[otherPlayers[key].socketId].x =
                                    otherPlayers[key].x;
                                this.allPlayers[otherPlayers[key].socketId].y =
                                    otherPlayers[key].y;
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].dash = otherPlayers[key].dash;
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].seat = otherPlayers[key].seat;
                            }
                        }
                    }
                }
            );

            this.socket!.on("newPlayerConnected", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    // console.log("newPlayerConnected, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        // console.log("already exist, so just set position");

                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
                    } else {
                        // console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerMoved", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    // console.log("playerMoved, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        // console.log("already exist, so just set position");
                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
                    } else {
                        // console.log("not exist, so create new one");
                        let playerSprite: Phaser.Physics.Arcade.Sprite =
                            this.createPlayer(playerInfo);
                        playerSprite.anims.play(
                            `${playerInfo.playerTexture}_idle_down`,
                            true
                        );
                    }
                }
            });

            this.socket!.on("playerDeleted", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "USAScene") {
                    // console.log("playerDeleted, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        // console.log("exist, deleted");
                        this.allPlayers[playerInfo.socketId].textObj?.destroy();
                        this.allPlayers[playerInfo.socketId].sprite.destroy();
                        delete this.allPlayers[playerInfo.socketId];
                    } else {
                        // console.log("not exist, so do nothing");
                    }
                }
            });
            this.socket!.on("disconnect", (reason: string) => {
                if (this.beforeDisconnectX === null && this.beforeDisconnectY === null) {
                    this.beforeDisconnectX = this.player1!.x;
                    this.beforeDisconnectY = this.player1!.y;
                }
                else {
                    this.beforeDisconnectX = null;
                    this.beforeDisconnectY = null;
                }
                this.scene.pause();
                console.log("client side disconnect, reason: ", reason);
            });
            for (let platform of this.tilemapLayerList) {
                this.physics.add.collider(this.player1!, platform);
            }
            if (initial && !this.socket!.recovered && this.beforeDisconnectX === null && this.beforeDisconnectY === null) {
                this.createUSANpc();
            }
        });
    }
}



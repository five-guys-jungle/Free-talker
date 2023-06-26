import Phaser from "phaser";
import axios, { all } from "axios";
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

// import { playerNicknameState } from '../recoil/user/atoms';
import { createCharacterAnims } from "../anims/CharacterAnims";
import {
    openNPCDialog,
    openAirport,
    openFreedialog,
    openReport,
    GAME_STATUS,
} from "../stores/gameSlice";
import { npcInfo } from "../characters/Npc";
import { appendMessage, clearMessages } from "../stores/talkBoxSlice";
import { appendCorrection, clearCorrections } from "../stores/reportSlice";
import { setScore } from "../stores/scoreSlice";
import {
    appendSentence,
    clearSentences,
    setCanRequestRecommend,
} from "../stores/sentenceBoxSlice";
import { setRecord, setMessage, setMessageColor } from "../stores/recordSlice";
import { handleScene } from "./common/handleScene";
import { RootState } from "../stores/index";

import dotenv from "dotenv";
import Report from "../components/Report";
import {
    setSocketNamespace,
    appendSocketNamespace,
} from "../stores/socketSlice";

const serverUrl: string = process.env.REACT_APP_SERVER_URL!;

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();

export default class AirportScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
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
    seatEvent: boolean = false;
    isAudioPlaying: boolean = false;
    isNpcSocketConnected: boolean = false;
    npcList: npcInfo[] = [];
    alreadyRecommended: boolean = false;

    speed: number = 200;
    dashSpeed: number = 600;
    tilemapLayerList: Phaser.Tilemaps.TilemapLayer[] = [];
    currNpcName: string = "";
    beforeSleepX: number = this.initial_x;
    beforeSleepY: number = this.initial_y;
    interactionSprite: Phaser.Physics.Arcade.Sprite | null = null;
    interactionSpriteE: Phaser.Physics.Arcade.Sprite | null = null;

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
    gamePause(pausedX: number, pausedY: number) {
        console.log("Scene is Paused: Airport");
        // this.intervalId = setInterval(() => {
        //     this.socket!.emit('heartbeat');
        // }, 5000);

    }
    gameResume(pausedX: number, pausedY: number) {
        console.log("Scene is Resumed: Airport");
        console.log("allPlayer in Resumed: ", this.allPlayers);
        // if(this.intervalId){
        //     clearInterval(this.intervalId);
        //     this.intervalId = null;
        // }
    }
    onSceneWake() {
        console.log("Scene has been woken up!, scene: AirportScene");
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
        console.log("Scene is now asleep!, scene: AirportScene");
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
        // this.game.events.on('pause', this.gamePause);
        this.events.on("wake", this.onSceneWake, this);
        this.events.on("sleep", this.onSceneSleep, this);

        // this.add.image(400, 300, "background");
        // 배경 설정
        this.cursors = this.input.keyboard!.createCursorKeys();
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

        this.tilemapLayerList.push(platform2);
        this.tilemapLayerList.push(platform3);
        this.tilemapLayerList.push(platform4);
        this.tilemapLayerList.push(platform5);
        this.tilemapLayerList.push(platform6);
        this.tilemapLayerList.push(platform7);

        createCharacterAnims(this.anims);
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
        this.userIdText = this.add.text(10, 10, "", {
            color: "black",
            fontSize: "16px",
        });

        let valve_E = true;
        // npc 와의 대화를 위한 키 설정
        let countUserSpeech: number;
        const addCountUserSpeech = () => {
            countUserSpeech++;
            console.log("User Speech Count: ", countUserSpeech);
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
        this.input.keyboard!.on("keydown-E", async () => {
            if (this.player1 === null || this.player1 === undefined) {
                return;
            }
            for (let npcInfo of this.npcList) {
                if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y,
                    npcInfo.x, npcInfo.y) < 100) {
                    console.log("npcInfo: ", npcInfo);
                    if (npcInfo.role === "freeTalkingPlace") {
                        console.log("chair");

                        if (valve_E === true) {
                            store.dispatch(
                                setSocketNamespace({
                                    socketNamespace: `${serverUrl}/freedialog/${npcInfo.name}`,
                                })
                            );
                            // store.dispatch(appendSocketNamespace({ socketNamespace: `/freedialog` }));
                            store.dispatch(openFreedialog());
                            this.cursors!.left.enabled = false;
                            this.cursors!.right.enabled = false;
                            this.cursors!.up.enabled = false;
                            this.cursors!.down.enabled = false;
                            valve_E = false;
                            // window.addEventListener("seat", (e: Event) => {
                            //     console.log("seat event listener");
                            //     this.player1!.anims.play(
                            //         `${this.player1!.texture.key}_sit_left`,
                            //         true
                            //     );
                            //     this.allPlayers[this.socket!.id].seat = true;
                            //     this.seatEvent = true;
                            // });

                            window.addEventListener("exitcall", (e: Event) => {
                                console.log("exitcall event listener");
                                this.player1!.setVelocity(0, 0);
                                this.player1!.setPosition(
                                    this.player1!.x,
                                    this.player1!.y,

                                );




                                this.cursors!.left.isDown = false;
                                this.cursors!.right.isDown = false;
                                this.cursors!.up.isDown = false;
                                this.cursors!.down.isDown = false;

                                this.cursors!.left.enabled = true;
                                this.cursors!.right.enabled = true;
                                this.cursors!.up.enabled = true;
                                this.cursors!.down.enabled = true;

                                store.dispatch(openAirport());
                                valve_E = true;
                                this.allPlayers[this.socket!.id].seat = false;
                                this.seatEvent = true;
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

                            store.dispatch(openAirport());
                            valve_E = true;
                            this.allPlayers[this.socket!.id].seat = false;
                            this.seatEvent = true;
                        }
                    } else if (npcInfo.name === 'gate') {
                        let gate: Phaser.Physics.Arcade.Sprite = npcInfo.sprite!;
                        gate.on('animationcomplete', () => {
                            // 여기서 애니메이션이 완료된 후 수행할 로직을 작성합니다.
                            console.log('Animation complete!');
                            handleScene(GAME_STATUS.USA, {
                                playerId: this.playerId,
                                playerNickname: this.userNickname,
                                playerTexture: this.playerTexture,
                            });
                        });
                        gate.play('gateAnim'); // 생성한 sprite에 애니메이션 적용
                        console.log("liberty");
                        // handleScene(GAME_STATUS.USA, {
                        //     playerId: this.playerId,
                        //     playerNickname: this.userNickname,
                        //     playerTexture: this.playerTexture,
                        // });
                    } else {
                        if (valve_E === true) {
                            if (this.isAudioPlaying) {
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
                                this.socket2 = io(`${serverUrl}/interaction`);
                                this.socket2.on("connect", () => {
                                    this.currNpcName = npcInfo.name;
                                    console.log(
                                        "connect, interaction socket.id: ",
                                        this.socket2!.id
                                    );
                                    countUserSpeech = 0;
                                    this.isNpcSocketConnected = true;
                                    window.addEventListener(
                                        "recomButtonClicked",
                                        (e: Event) => {
                                            const customEvent =
                                                e as CustomEvent;
                                            store.dispatch(clearSentences());
                                            if (
                                                customEvent.detail.message === 0
                                            ) {
                                                store.dispatch(
                                                    appendSentence({
                                                        _id: "1",
                                                        sentence:
                                                            "추천 문장을 준비 중입니다. 잠시만 기다려 주세요.",
                                                    })
                                                );
                                            }
                                            console.log(
                                                "lastMessage in SectanceBox: ",
                                                customEvent.detail.lastMessage
                                            );
                                            this.socket2!.emit(
                                                "getRecommendedResponses",
                                                this.currNpcName,
                                                this.alreadyRecommended,
                                                customEvent.detail.lastMessage
                                            );
                                            store.dispatch(
                                                setCanRequestRecommend(false)
                                            );
                                        }
                                    );

                                    this.interacting = true;
                                    console.log(
                                        "connect, interaction socket.id: ",
                                        this.socket2!.id
                                    );
                                    this.socket2!.on(
                                        "speechToText",
                                        (response: string) => {
                                            if (
                                                response === "" ||
                                                response ===
                                                "convertSpeechToText Error" ||
                                                response === "chain call error"
                                            ) {
                                                store.dispatch(
                                                    setMessage(
                                                        "잠시 후 다시 시도해주세요"
                                                    )
                                                );
                                                store.dispatch(
                                                    setMessageColor("red")
                                                );
                                                store.dispatch(setRecord(true));
                                                this.isAudioPlaying = true;
                                                setTimeout(() => {
                                                    store.dispatch(
                                                        setMessage(
                                                            "R키를 눌러 녹음을 시작하세요"
                                                        )
                                                    );
                                                    store.dispatch(
                                                        setRecord(false)
                                                    );
                                                    this.isAudioPlaying = false;
                                                    store.dispatch(
                                                        setMessageColor("black")
                                                    );
                                                }, 2500);

                                                store.dispatch(
                                                    setCanRequestRecommend(
                                                        false
                                                    )
                                                );
                                            } else {
                                                addCountUserSpeech();
                                                console.log("USER: ", response);
                                                console.log(
                                                    "playerTexture",
                                                    this.playerTexture
                                                );
                                                store.dispatch(
                                                    // this.userIdText
                                                    appendMessage({
                                                        playerId: this.playerId,
                                                        name: this.userNickname,
                                                        img: this.playerTexture,
                                                        // img: "",
                                                        side: "right",
                                                        text: response,
                                                    })
                                                );
                                            }
                                        }
                                    );
                                    this.socket2!.on(
                                        "npcResponse",
                                        (response: string) => {
                                            console.log("NPC: ", response);
                                            store.dispatch(
                                                appendMessage({
                                                    playerId: this.playerId,
                                                    name: npcInfo.name,
                                                    img: npcInfo.texture,
                                                    // img: "",
                                                    side: "left",
                                                    text: response,
                                                })
                                            );
                                            store.dispatch(clearSentences());
                                            this.alreadyRecommended = false;
                                        }
                                    );
                                    this.socket2!.on(
                                        "totalResponse",
                                        (response: any) => {
                                            console.log(
                                                "totalResponse event response: ",
                                                response
                                            );
                                            // this.isAudioPlaying = true;
                                            const audio = new Audio(
                                                response.audioUrl
                                            );
                                            audio.onended = () => {
                                                console.log("audio.onended");
                                                this.isAudioPlaying = false;
                                                store.dispatch(
                                                    setMessage(
                                                        "R키를 눌러 녹음을 시작하세요"
                                                    )
                                                );
                                                store.dispatch(
                                                    setCanRequestRecommend(true)
                                                );
                                            };
                                            audio.play();
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
                                                    responses[0]
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
                                                            _id: index.toString(),
                                                            sentence: response,
                                                        })
                                                    );
                                                }
                                            );
                                            this.alreadyRecommended = true;
                                        }
                                    );
                                });
                            } else {
                                this.currNpcName = "";
                                // 이미 소켓이 연결되어 있는데 다시 한번 E키를 누른 경우 -> 대화 종료 상황
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
                                let score =
                                    ((countUserSpeech -
                                        grammarCorrections.length) /
                                        countUserSpeech) *
                                    100;
                                console.log("score : ", score);
                                store.dispatch(setScore({ score: score }));
                                grammarCorrections.forEach((data, index) => {
                                    console.log(
                                        "grammarCorrection data: ",
                                        data
                                    );
                                    store.dispatch(
                                        appendCorrection({
                                            original: data.userText,
                                            correction: data.correctedText,
                                        })
                                    );
                                });

                                store.dispatch(openReport());
                                grammarCorrections = [];
                                valve_E = false;
                            }
                        } else {
                            countUserSpeech = 0;
                            store.dispatch(setScore({ score: 0 }));
                            store.dispatch(clearCorrections());
                            store.dispatch(clearMessages());
                            store.dispatch(clearSentences());
                            store.dispatch(openAirport());
                            valve_E = true;
                        }
                    }
                    break;
                }
            }
        });
        // 녹음 데이터를 보내고 응답을 받는 키 설정
        this.input.keyboard!.on("keydown-R", async () => {
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
                                setMessage("R키를 눌러 녹음을 시작하세요")
                            );
                            this.isAudioPlaying = true;
                            this.recorder2!.stop();
                        } else {
                            store.dispatch(setCanRequestRecommend(false));
                            store.dispatch(setRecord(false));
                            store.dispatch(
                                setMessage(
                                    "녹음 중입니다. R키를 눌러 녹음을 종료하세요"
                                )
                            );
                            this.recorder2!.start();
                        }
                    }

                    break;
                }
            }
        });
    }
    playInteractionAnims() {
        for (let npcInfo of this.npcList) {
            if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y, npcInfo.x, npcInfo.y) < 100) {
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
    deleteNotVaildScoket() {
        for (let key in this.allPlayers) {
            // console.log(`allPlayer[${key}]: ${this.allPlayers[key]}, socket: ${this.socket}`);
            if (this.socket!.id !== key && this.userNickname === this.allPlayers[key].nickname) {
                console.log(`allPlayer[${key}]: ${this.allPlayers[key]}, socket: ${this.socket}`);
                this.allPlayers[key].textObj?.destroy();
                this.allPlayers[key].sprite.destroy();
                delete this.allPlayers[key];
            }
        }
    }
    update(time: number, delta: number) {
        this.deleteNotVaildScoket();
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
                else if (this.cursors!.up.isDown) {
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
                    let idle_anims: string = this.player1!.anims.currentAnim!.key;
                    idle_anims = idle_anims.replace('run', 'idle');
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
                    scene: "AirportScene",
                    dash: this.cursors?.shift.isDown,
                    seat: this.allPlayers[this.socket!.id].seat,
                });
            }
            if (this.seatEvent === true) {
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
                    this.seatEvent = false
                )
            }

            this.socket!.on("otherseat", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene == "AirportScene") {
                    this.allPlayers[playerInfo.socketId].seat = playerInfo.seat;
                    console.log("otherseat", playerInfo);
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
    }
    createPlayer(playerInfo: PlayerInfo): Phaser.Physics.Arcade.Sprite {
        // Create a sprite for the player
        // Assuming you have an image asset called 'player'
        let playerSprite = this.physics.add.sprite(
            playerInfo.x,
            playerInfo.y,
            playerInfo.playerTexture
        ).setDepth(2);

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
        this.allPlayers[playerInfo.socketId] = newPlayer;
        return playerSprite;
    }
    async recordEventHandler() {
        await navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                if (this.recorder2 === null || this.recorder2 === undefined) {
                    this.recorder2 = new MediaRecorder(stream);
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
                            setMessage("응답 중입니다. 잠시만 기다려주세요")
                        );
                        console.log("this.currNpcName: ", this.currNpcName);
                        this.socket2!.emit("audioSend", {
                            userNickname: this.userNickname,
                            npcName: this.currNpcName, // TODO: npc 이름 받아오기
                            audioDataBuffer: buffer,
                        });
                    });
                };
            })
            .catch((error) => {
                console.log(error);
            });
    }
    createAirportNpc() {
        let npc1: npcInfo = {
            name: "ImmigrationOfficer",
            x: 1700,
            y: 1300,
            texture: "ImmigrationOfficer",
            sprite: null,
            role: "npc",
        };
        npc1.sprite = this.physics.add.sprite(npc1.x, npc1.y, npc1.texture);
        this.npcList.push(npc1);

        let gate: npcInfo = {
            name: "gate",
            x: 1695,
            y: 1100,
            texture: "gate",
            sprite: null,
            role: "gate",
        };
        gate.sprite = this.physics.add.sprite(gate.x, gate.y, gate.texture);
        gate.sprite.setScale(1.6);
        // gate.sprite.play("gateAnim");
        this.npcList.push(gate);
    }
    gameSocketEventHandler(initial: boolean = true) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            console.log("connect, socket.id: ", this.socket!.id);
            this.player1 = this.createPlayer({
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
                scene: "AirportScene",
                dash: false,
                seat: false
            });
            this.player1!.x = this.beforeSleepX
            this.player1!.y = this.beforeSleepY;

            this.cameras.main.startFollow(this.player1);
            this.cameras.main.zoom = 1.2;

            this.socket!.emit("connected", {
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.player1.x,
                y: this.player1.y,
                scene: "AirportScene",
                dash: false,
                seat: false
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

                                this.allPlayers[otherPlayers[key].socketId].x =
                                    otherPlayers[key].x;
                                this.allPlayers[otherPlayers[key].socketId].y =
                                    otherPlayers[key].y;
                                this.allPlayers[
                                    otherPlayers[key].socketId
                                ].dash = otherPlayers[key].dash;
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

                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
                    } else {
                        console.log("not exist, so create new one");
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
                if (playerInfo.scene === "AirportScene") {
                    console.log("playerMoved, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        console.log("already exist, so just set position");
                        this.allPlayers[playerInfo.socketId].x = playerInfo.x;
                        this.allPlayers[playerInfo.socketId].y = playerInfo.y;
                        this.allPlayers[playerInfo.socketId].dash =
                            playerInfo.dash;
                    } else {
                        console.log("not exist, so create new one");
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
            this.socket!.on("disconnect", (reason: string) => {
                console.log("client side disconnect, reason: ", reason);
                // window.location.reload();
            });
            for (let platform of this.tilemapLayerList) {
                this.physics.add.collider(this.player1, platform);
            }
            if (initial) {
                this.createAirportNpc();
            }
        });
    }
}

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

export default class USAScene extends Phaser.Scene {
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    initial_x: number = 1850;
    initial_y: number = 800;
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
    
    gamePause(pausedX: number, pausedY: number) {
        console.log("Scene is Paused: USA");
        // this.intervalId = setInterval(() => {
        //     this.socket!.emit('heartbeat');
        // }, 5000);

    }
    gameResume(pausedX: number, pausedY: number) {
        console.log("Scene is Resumed: USA");
        console.log("allPlayer in Resumed: ", this.allPlayers);
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
        this.beforeSleepX = this.player1 ? this.player1!.x: this.initial_x;
        this.beforeSleepY = this.player1 ? this.player1!.y: this.initial_y;
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

        createCharacterAnims(this.anims);
        if (this.socket) {
            this.socket.disconnect();
        }
        this.gameSocketEventHandler();

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
                if (
                    Phaser.Math.Distance.Between(
                        this.player1!.x,
                        this.player1!.y,
                        npcInfo.x,
                        npcInfo.y
                    ) < 100
                ) {
                    console.log("npcInfo: ", npcInfo);
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
                            window.addEventListener("seat", (e: Event) => {
                                console.log("seat event listener");
                                this.player1!.anims.play(
                                    `${this.player1!.texture.key}_sit_left`,
                                    true
                                );
                                this.allPlayers[this.socket!.id].seat = true;
                                this.seatEvent = true;
                            });

                            window.addEventListener("exitcall", (e: Event) => {
                                console.log("exitcall event listener");
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
                                this.allPlayers[this.socket!.id].seat = false;
                                this.seatEvent = true;
                                store.dispatch(openUSA());
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
                            this.allPlayers[this.socket!.id].seat = false;
                            this.seatEvent = true;
                            store.dispatch(openUSA());
                        }}
                    
                    else if (npcInfo.role === "rolePlayingPlace") {
                            console.log("chair");
    
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
                               
    
                                window.addEventListener("exitcall", (e: Event) => {
                                    console.log("exitcall event listener");
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
                                    this.allPlayers[this.socket!.id].seat = false;
                                    this.seatEvent = true;
                                    store.dispatch(openUSA());
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

                                store.dispatch(openUSA());
                            }
                    } else if (npcInfo.name.includes("Liberty")) {
                        console.log("liberty");
                        handleScene(GAME_STATUS.AIRPORT, {});
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
                                                        "다시 말씀해주세요"
                                                    )
                                                );
                                                store.dispatch(
                                                    setMessageColor("red")
                                                );
                                                setTimeout(() => {
                                                    store.dispatch(
                                                        setMessage(
                                                            "R키를 눌러 녹음을 시작하세요"
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
                                                console.log("USER: ", response);
                                                console.log(
                                                    "playerTexture",
                                                    this.playerTexture
                                                );
                                                store.dispatch(
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
                                // 이미 소켓이 연결되어 있는데 다시 한번 E키를 누른 경우 -> 대화 종료 상황
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
                            valve_E = true;
                            store.dispatch(setScore({ score: 0 }));
                            store.dispatch(clearCorrections());
                            store.dispatch(clearMessages());
                            store.dispatch(clearSentences());
                            store.dispatch(openUSA());
                            
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
    deleteNotVaildScoket(){
        for(let key in this.allPlayers){
            // console.log(`allPlayer[${key}]: ${this.allPlayers[key]}, socket: ${this.socket}`);
            if(this.socket!.id !== key && this.userNickname === this.allPlayers[key].nickname){
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
                    scene: "USAScene",
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
                if (playerInfo.scene == "USAScene") {
                    this.allPlayers[playerInfo.socketId].seat = playerInfo.seat;
                    console.log("otherseat", playerInfo);
                }});

            for (let key in this.allPlayers) {
                if (key !== this.socket.id) {
                    let deltaInSecond: number = delta / 1000;
                    let otherPlayer: Player = this.allPlayers[key];
                    otherPlayer.move(deltaInSecond);
                    this.allPlayers[key].moveText(this);
                    if (otherPlayer.seat == true) {
                        otherPlayer.sprite.anims.play(
                            `${otherPlayer.sprite.texture.key}_sit_left`,
                            true
                        );
                    }
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
    createUSANpc() {
        let gate: npcInfo = {
            name: "statueOfLiberty",
            x: this.initial_x,
            y: this.initial_y,
            texture: "statueOfLiberty",
            sprite: null,
            role: "npc",
        };
        gate.sprite = this.physics.add.sprite(gate.x, gate.y, gate.texture);
        gate.sprite.alpha = 0;
        gate.sprite.setScale(0.35);
        this.npcList.push(gate);

        this.physics.add.sprite(1819, 1200, "statueOfLiberty").setDepth(3);

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
            x: 1741,
            y: 2213,
            texture: "Nurse",
            sprite: null,
            role: "npc",
        };
        npc4.sprite = this.physics.add.sprite(npc4.x, npc4.y, npc4.texture).setDepth(1);
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
        let npc8: npcInfo = {
            name: "Waitress",
            x: 2928,
            y: 432,
            texture: "Waitress",
            sprite: null,
            role: "npc",
        };
        npc8.sprite = this.physics.add.sprite(npc8.x, npc8.y, npc8.texture);
        this.npcList.push(npc8);

        let interact_sprite1: npcInfo = {
            name: "coach_park",
            x: 1485,
            y: 1157,
            texture: "coach_park",
            sprite: null,
            role: "freeTalkingPlace",
        };
        interact_sprite1.sprite = this.physics.add.sprite(interact_sprite1.x, interact_sprite1.y, interact_sprite1.texture);
        this.npcList.push(interact_sprite1);

        let interact_sprite2: npcInfo = {
            name: "chairMart",
            x: 2603,
            y: 1362,
            texture: "chairMart",
            sprite: null,
            role: "rolePlayingPlace",
        };
        interact_sprite2.sprite = this.physics.add.sprite(interact_sprite2.x, interact_sprite2.y, interact_sprite2.texture);
        this.npcList.push(interact_sprite2);
    }
    gameSocketEventHandler(initial: boolean = true) {
        this.socket = io(serverUrl);

        this.socket!.on("connect", () => {
            console.log("connect, socket.id: ", this.socket!.id);
            this.player1 = this.createPlayer({
                socketId: this.socket!.id,
                nickname: this.userNickname,
                playerTexture: this.playerTexture,
                x: this.initial_x,
                y: this.initial_y,
                scene: "USAScene",
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
                scene: "USAScene",
                dash: false,
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
                if (playerInfo.scene === "USAScene") {
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
                if (playerInfo.scene === "USAScene") {
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
                if (playerInfo.scene === "USAScene") {
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
                this.createUSANpc();
            }
        });
    }
}

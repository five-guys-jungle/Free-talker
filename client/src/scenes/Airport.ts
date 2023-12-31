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
    updateTTSLoading,
    updateAudioUrl
} from "../stores/sentenceBoxSlice";
import { setRecord, setMessage, setMessageColor } from "../stores/recordSlice";
import { reportOn, reportOff } from "../stores/reportOnoffSlice";
import { handleScene } from "./common/handleScene";
import { RootState } from "../stores/index";
import { changeLevel } from "../stores/levelSlice";

import dotenv from "dotenv";
import Report from "../components/Report";
import {
    setSocketNamespace,
    appendSocketNamespace,
} from "../stores/socketSlice";
import { toggleIsClicked } from "../stores/guiderSlice";
import { setText } from "../stores/translationSlice";
import { RepeatOneSharp } from '@material-ui/icons';

const serverUrl: string = process.env.REACT_APP_SERVER_URL!;

let chunks: BlobPart[] = [];
let audioContext = new window.AudioContext();
let DB_URL: string = process.env.REACT_APP_SERVER_URL!;

export default class AirportScene extends Phaser.Scene {
    background!: Phaser.GameObjects.Image;
    player1: Phaser.Physics.Arcade.Sprite | null = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    interactKey: Phaser.Input.Keyboard.Key | null = null;
    interactText: Phaser.GameObjects.Text | null = null;
    userIdText: Phaser.GameObjects.Text | null = null;
    initial_x: number = 705;
    initial_y: number = 674;
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
    isAudioTransfered: boolean = false;
    isNpcSocketConnected: boolean = false;
    npcList: npcInfo[] = [];
    alreadyRecommended: boolean = false;
    level: string = "intermediate";
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
    beforeDisconnectX: number | null = null;
    beforeDisconnectY: number | null = null;

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
        this.level = data.level;
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
        console.log("this.socket in Resumed: ", this.socket);
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
        // window.onbeforeunload = async () => {
        //     this.socket?.disconnect();
        //     console.log("beforeunload");
        //     const body = { userId: this.playerId }
        //     axios.post(`${DB_URL}/auth/logout`, body);
        // };

        this.background = this.add
            .image(this.initial_x, this.initial_y, "background")
            .setDisplaySize(this.cameras.main.width * 4, this.cameras.main.height * 4)
            .setOrigin(0.5, 0.5);

        this.game.events.on('pause', this.gamePause);
        this.events.on("wake", this.onSceneWake, this);
        this.events.on("sleep", this.onSceneSleep, this);

        // this.add.image(400, 300, "background");
        // 배경 설정
        this.cursors = this.input.keyboard!.createCursorKeys();
        const map = this.make.tilemap({ key: "map" });
        const tileset_exteriors = map.addTilesetImage(
            "fiveguys_Exteriors",
            "fiveguys_Exteriors"
        )!;
        const tileset_interiors_1 = map.addTilesetImage(
            "fiveguys_Interiors_1",
            "fiveguys_Interiors_1"
        )!;
        const tileset_interiors_2 = map.addTilesetImage(
            "fiveguys_Interiors_2",
            "fiveguys_Interiors_2"
        )!;
        const tileset_interiors_3 = map.addTilesetImage(
            "fiveguys_Interiors_3",
            "fiveguys_Interiors_3"
        )!;
        const tileset_interiors_4 = map.addTilesetImage(
            "fiveguys_Interiors_4",
            "fiveguys_Interiors_4"
        )!;
        const tileset_roombuilder = map.addTilesetImage(
            "fiveguys_Room_Builder",
            "fiveguys_Room_Builder"
        )!;
        const tileset_immigration = map.addTilesetImage(
            "fiveguys_Immigrations",
            "fiveguys_Immigrations"
        )!;


        const roombuilder_1 = map.createLayer("layer1/Roombuilder", tileset_roombuilder)!;
        const roombuilder_2 = map.createLayer("layer2/Roombuilder", tileset_roombuilder)!;
        const exteriors = map.createLayer("layer1/Exteriors", tileset_exteriors)!;
        const interiors_1 = map.createLayer("layer1/Interiors1", tileset_interiors_1)!;
        const interiors_2 = map.createLayer("layer1/Interiors2", tileset_interiors_2)!;
        const interiors_3 = map.createLayer("layer1/Interiors3", tileset_interiors_3)!;
        const interiors_4 = map.createLayer("layer1/Interiors4", tileset_interiors_4)!;
        const immigration = map.createLayer("layer1/Immigration", tileset_immigration)!;

        roombuilder_1.setCollisionByProperty({ collides: true });
        roombuilder_2.setCollisionByProperty({ collides: true });
        exteriors.setCollisionByProperty({ collides: true });
        interiors_1.setCollisionByProperty({ collides: true });
        interiors_2.setCollisionByProperty({ collides: true });
        interiors_3.setCollisionByProperty({ collides: true });
        interiors_4.setCollisionByProperty({ collides: true });
        immigration.setCollisionByProperty({ collides: true });

        this.tilemapLayerList.push(roombuilder_1);
        this.tilemapLayerList.push(roombuilder_2);
        this.tilemapLayerList.push(exteriors);
        this.tilemapLayerList.push(interiors_1);
        this.tilemapLayerList.push(interiors_2);
        this.tilemapLayerList.push(interiors_3);
        this.tilemapLayerList.push(interiors_4);
        this.tilemapLayerList.push(immigration)

        createCharacterAnims(this.anims);
        if (this.socket) {
            this.socket.disconnect();
        }
        this.gameSocketEventHandler();
        store.dispatch(toggleIsClicked());
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
        this.level = "intermediate";

        window.addEventListener('levelChanged', (event) => {
            if (this.level === "intermediate") {
                this.level = "advanced";
            } else if (this.level === "advanced") {
                this.level = "beginner";
            } else if (this.level === "beginner") {
                this.level = "intermediate";
            }
            // console.log(`level : ${this.level}`);
        });
        this.input.keyboard!.on("keydown-E", async () => {
            if (this.player1 === null || this.player1 === undefined) {
                return;
            }

            for (let npcInfo of this.npcList) {
                if (Phaser.Math.Distance.Between(this.player1!.x, this.player1!.y,
                    npcInfo.x, npcInfo.y) < 100) {
                    // console.log("npcInfo: ", npcInfo);
                    if (npcInfo.role === "freeTalkingPlace") {
                        // console.log("chair");

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
                                // console.log("exitcall event listener");
                                this.player1!.setVelocity(0, 0);
                                this.player1!.setPosition(
                                    this.player1!.x,
                                    this.player1!.y,

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
                                this.allPlayers[this.socket!.id].seat = 0;
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
                            this.allPlayers[this.socket!.id].seat = 0;
                            this.seatEvent = true;
                        }
                    } else if (npcInfo.name === 'gate') {
                        this.cursors!.left.isDown = false;
                        this.cursors!.right.isDown = false;
                        this.cursors!.up.isDown = false;
                        this.cursors!.down.isDown = false;
                        this.cursors!.left.enabled = false;
                        this.cursors!.right.enabled = false;
                        this.cursors!.up.enabled = false;
                        this.cursors!.down.enabled = false;
                        this.player1!.setVelocity(0, 0);
                        this.player1!.setPosition(
                            this.player1!.x,
                            this.player1!.y)

                        setTimeout(() => {
                            this.cursors!.left.enabled = true;
                            this.cursors!.right.enabled = true;
                            this.cursors!.up.enabled = true;
                            this.cursors!.down.enabled = true;
                        }, 1500);
                        let gate: Phaser.Physics.Arcade.Sprite = npcInfo.sprite!;
                        gate.on('animationcomplete', () => {
                            // 여기서 애니메이션이 완료된 후 수행할 로직을 작성합니다.
                            console.log("Animation complete!");
                            handleScene(GAME_STATUS.USA, {
                                playerId: this.playerId,
                                playerNickname: this.userNickname,
                                playerTexture: this.playerTexture,
                                level: this.level
                            });
                        });
                        gate.play("gateAnim"); // 생성한 sprite에 애니메이션 적용
                        // console.log("liberty");
                        // handleScene(GAME_STATUS.USA, {
                        //     playerId: this.playerId,
                        //     playerNickname: this.userNickname,
                        //     playerTexture: this.playerTexture,
                        // });
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
                                // console.log("recommendBtnClicked: ", recommendBtnClicked);
                                this.currNpcName = npcInfo.name;
                                console.log(
                                    "connect, interaction socket.id: ",
                                    this.socket2!.id
                                );
                                countUserSpeech = 0;
                                this.isNpcSocketConnected = true;
                                this.interacting = true;
                                this.socket2!.emit("dialogStart", npcInfo.name, this.level);
                                this.isAudioPlaying = true;
                                this.socket2!.on("translatedText", (translatedText: string) => {
                                    console.log("translatedText: ", translatedText);
                                    if (translatedText === "ChatGPT API Error.") {
                                        store.dispatch(setText("다시 한번 시도해주세요."));
                                    }
                                    else {
                                        store.dispatch(setText(translatedText));
                                    }
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

                                window.addEventListener(
                                    "recomButtonClicked", recommendBtnClicked
                                );
                                window.addEventListener(
                                    "translationEvent", translationEvent
                                );
                                window.addEventListener("requestTTS", requestTTSEvent);

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
                                                // this.userIdText
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
                                //                 audioUrl: response.audioUrl
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
                                            console.log("요청 실패, 재요청");
                                            this.alreadyRecommended = false;
                                            this.socket2!.emit(
                                                "getRecommendedResponses",
                                                this.currNpcName,
                                                this.alreadyRecommended,
                                                responses[0],
                                                this.level
                                            );
                                            store.dispatch(
                                                setCanRequestRecommend(false)
                                            );
                                            return;
                                        }
                                        // TODO : Store에 SentenceBox 상태정의하고 dispatch
                                        store.dispatch(clearSentences());
                                        responses.forEach((response, index) => {

                                            store.dispatch(
                                                appendSentence({
                                                    _id: index,
                                                    sentence: response,
                                                })
                                            );
                                        });
                                        this.alreadyRecommended = true;
                                    }
                                );
                                this.socket2!.on(
                                    "responseTTS", (data: { user: string, assitant: string, audioUrl: string, id: number }) => {
                                        // If found, update its audio URL in the Redux store
                                        store.dispatch(updateAudioUrl({ index: data.id, audioUrl: data.audioUrl }));
                                        // console.log(`responseTTS: audioUrl: ${data.audioUrl}`);

                                    }
                                );


                            });
                        } else {
                            this.isAudioTransfered = false;
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
                            let score = 0;
                            if (countUserSpeech !== 0) {
                                score = ((countUserSpeech - grammarCorrections.length) /
                                    countUserSpeech) * 100;
                            }

                            store.dispatch(setScore({ score: score }));
                            grammarCorrections.forEach((data, index) => {
                                // console.log("grammarCorrection data: ", data);
                                store.dispatch(
                                    appendCorrection({
                                        original: data.userText,
                                        correction: data.correctedText,
                                    })
                                );
                            });
                            this.isReportOn = true;
                            store.dispatch(openReport());
                            store.dispatch(reportOn("airport"));
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
                console.log("음성 재생중입니다.")
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
                    // console.log("R key pressed");

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
            .setDisplaySize(this.cameras.main.width * 4, this.cameras.main.height * 4)
            .setOrigin(0.5, 0.5);

        let speed: number = this.cursors?.shift.isDown
            ? this.dashSpeed
            : this.speed;
        let velocityX = 0;
        let velocityY = 0;

        if (this.player1 !== null && this.player1 !== undefined) {
            this.playInteractionAnims();
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
                } else if (this.cursors!.up.isDown) {
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
            // this.userIdText!.setText(this.userNickname);
            this.userIdText!.setX(this.player1!.x);
            this.userIdText!.setY(this.player1!.y - 50);

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
                        // console.log("buffer: ", buffer);
                        store.dispatch(
                            setMessage("응답 중입니다\n잠시만 기다려주세요")
                        );
                        // console.log("this.currNpcName: ", this.currNpcName);
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
    createAirportNpc() {
        let npc1: npcInfo = {
            name: "ImmigrationOfficer",
            x: 600,
            y: 243,
            texture: "ImmigrationOfficer",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc1.sprite = this.physics.add.sprite(npc1.x, npc1.y, npc1.texture);
        this.npcList.push(npc1);

        let npc2: npcInfo = {
            name: "ImmigrationOfficer",
            x: 366,
            y: 243,
            texture: "ImmigrationOfficer",
            sprite: null,
            role: "npc",
            moving: false,
        };
        npc2.sprite = this.physics.add.sprite(npc2.x, npc2.y, npc2.texture);
        this.npcList.push(npc2);

        // let chair: npcInfo = {
        //     name: "airport_chair1",
        //     x: 1400,
        //     y: 1400,
        //     texture: "airport_chair",
        //     sprite: null,
        //     role: "freeTalkingPlace",
        // };
        // chair.sprite = this.physics.add.sprite(chair.x, chair.y, chair.texture);
        // this.npcList.push(chair);

        // let npc2: npcInfo = {
        //     name: "statueOfLiberty",
        //     x: 2150,
        //     y: 1430,
        //     texture: "statueOfLiberty",
        //     sprite: null,
        //     role: "npc",
        // };
        // npc2.sprite = this.physics.add.sprite(npc2.x, npc2.y, npc2.texture);
        // npc2.sprite.setScale(0.35);
        // this.npcList.push(npc2);
        let gate1: npcInfo = {
            name: "gate",
            x: 706,
            y: 47,
            texture: "gate",
            sprite: null,
            role: "npc",
            moving: false,
        };
        gate1.sprite = this.physics.add.sprite(gate1.x, gate1.y, gate1.texture);
        gate1.sprite.setScale(1.6);
        // gate.sprite.play("gateAnim");
        this.npcList.push(gate1);


        let gate2: npcInfo = {
            name: "gate",
            x: 476,
            y: 47,
            texture: "gate",
            sprite: null,
            role: "npc",
            moving: false,
        };
        gate2.sprite = this.physics.add.sprite(gate2.x, gate2.y, gate2.texture);
        gate2.sprite.setScale(1.6);
        // gate.sprite.play("gateAnim");
        this.npcList.push(gate2);

        let gate3: npcInfo = {
            name: "gate",
            x: 925,
            y: 47,
            texture: "gate",
            sprite: null,
            role: "npc",
            moving: false,
        };
        gate3.sprite = this.physics.add.sprite(gate3.x, gate3.y, gate3.texture);
        gate3.sprite.setScale(1.6);
        // gate.sprite.play("gateAnim");
        this.npcList.push(gate3);




    }
    gameSocketEventHandler(initial: boolean = true) {
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
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
                    scene: "AirportScene",
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
                scene: "AirportScene",
                dash: false,
                seat: false,
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
                                let playerSprite: Phaser.Physics.Arcade.Sprite =
                                    this.createPlayer(otherPlayers[key]);
                                // playerSprite.setCollideWorldBounds(true);
                                playerSprite.anims.play(
                                    `${otherPlayers[key].playerTexture}_idle_down`,
                                    true
                                );
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
                            }
                        }
                    }
                }
            );

            this.socket!.on("newPlayerConnected", (playerInfo: PlayerInfo) => {
                if (playerInfo.scene === "AirportScene") {
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
                if (playerInfo.scene === "AirportScene") {
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
                if (playerInfo.scene === "AirportScene") {
                    // console.log("playerDeleted, playerInfo: ", playerInfo);
                    if (playerInfo.socketId in this.allPlayers) {
                        // console.log("exist, deleted");
                        this.allPlayers[playerInfo.socketId].textObj?.destroy();
                        this.allPlayers[playerInfo.socketId].sprite.destroy();
                        delete this.allPlayers[playerInfo.socketId];
                    } else {
                        console.log("not exist, so do nothing");
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
                this.createAirportNpc();
            }
        });
    }
}

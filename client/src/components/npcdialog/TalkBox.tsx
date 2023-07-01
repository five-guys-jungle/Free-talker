import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import {
    Message,
    appendMessage,
    TalkBoxState,
} from "../../stores/talkBoxSlice";

const TalkBox: React.FC = () => {
    // const [messages, setMessages] = useState<Message[]>([]);
    // const msgerInputRef = useRef<HTMLInputElement>(null);
    // const msgerChatRef = useRef<HTMLDivElement>(null);
    const messages = useSelector(
        (state: { talkBox: TalkBoxState }) => state.talkBox.messages
    );
    const dispatch = useDispatch();
    const msgerInputRef = useRef<HTMLInputElement>(null);
    const msgerChatRef = useRef<HTMLDivElement>(null);

    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const playAudio = (audioUrl: string) => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
        }

        const audio = new Audio(audioUrl);
        audio.onended = () => setCurrentAudio(null);
        audio.play();
        setCurrentAudio(audio);
    };

    const pauseAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
        }
    }

    useEffect(() => {
        if (msgerChatRef.current) {
            msgerChatRef.current.scrollTop = msgerChatRef.current.scrollHeight;
        }
    }, [messages]);


    return (
        <TalkDiv>
            <section className="msger">
                <main className="msger-chat" ref={msgerChatRef}>
                    {messages.map((message, index) => (
                        <div className={`msg ${message.side}-msg`} key={index}>
                            <div
                                className="msg-img"
                                style={{
                                    backgroundImage: `url(${message.side === "left"
                                        ? `./assets/characters/single/${message.img}.png`
                                        : `./assets/characters/single/${message.img}.png`
                                        })`,
                                }}
                            ></div>

                            <div className="msg-bubble">
                                <div className="msg-info">
                                    <div
                                        className={`msg-info-name ${message.side === "left"
                                            ? "bot-name"
                                            : ""
                                            }`}
                                    >
                                        {message.side === "left"
                                            ? message.name
                                            : message.name}
                                    </div>
                                    {/* <div className="msg-info-time">{formatDate(new Date())}</div> */}
                                </div>

                                <div className="msg-text">{message.text}</div>
                                {message.audioUrl && (
                                    currentAudio && currentAudio.src === message.audioUrl ?
                                        <PauseIcon onClick={pauseAudio} /> :
                                        <PlayArrowIcon onClick={() => playAudio(message.audioUrl)} />
                                )}
                            </div>
                        </div>
                    ))}
                </main>
                {/* { */}
                {/* // </form>} */}
            </section>
        </TalkDiv>
    );
};
export default TalkBox;

const TalkDiv = styled.div`
    font-family: 'Open Sans', sans-serif;
    :root {
        --body-bg: rgba(
            255,
            255,
            255,
            0.5);
        // --msger-bg: #fff;
        --border: 2px solid #ddd;
        --left-msg-bg: rgba(
            255,
            255,
            255,
            0)
        --right-msg-bg: rgba(
            255,
            255,
            255,
            0);
    }

    html {
        box-sizing: border-box;
    }

    *,
    *:before,
    *:after {
        margin: 0;
        padding: 0;
        box-sizing: inherit;
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        // background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        font-family: Helvetica, sans-serif;
        background-color: rgba(
            255,
            255,
            255,
            0
        ); // Semi-transparent white background
    }

    .msger {
        display: flex;
        flex-flow: column wrap;
        // align-items: stretch;
        // justify-content: space-between;
        // width: 500px;
        // max-width: 500px;
        // max-width: 700px;
        margin: 0 10px 70px 10px;
        width: 45vw;
        height: 85vh;
        // height: 700px;
        border: 2px solid #ddd;
        border-radius: 5px;
        rgba(
            255,
            255,
            255,
            0.5);
        // box-shadow: 0 15px 15px -5px rgba(0, 0, 0, 0.2);
    }

    // .msger-header {
    //     display: flex;
    //     justify-content: space-between;
    //     padding: 10px;
    //     border-bottom: 2px solid #ddd;
    //     background: #eee;
    //     color: #666;
    // }

    .msger-chat {
        font-size: 3vh;
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        // max-height: calc(100% - 150px); /* 채팅창 최대 높이 설정 */
        background-color: rgba(
            255,
            255,
            255,
            0.7
        ); // Semi-transparent white background
    }

    .msger-chat::-webkit-scrollbar {
        width: 6px;
    }

    .msger-chat::-webkit-scrollbar-track {
        background: #ddd;
    }

    .msger-chat::-webkit-scrollbar-thumb {
        background: #bdbdbd;
    }

    .msg {
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
        background-color: rgba(
            255,
            255,
            255,
            0.5
        ); // Semi-transparent white background
    }

    .msg:last-of-type {
        margin: 0;
    }

    .msg-img {
        width: 65px;
        height: 65px;
        margin-right: 10px;
        background: #ddd;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        border-radius: 50%;
    }

    .msg-bubble {
        max-width: 30vw;
        padding: 15px;
        border-radius: 15px;
        background: #ececec;
    }

    .msg-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .msg-info-name {
        margin-right: 10px;
        font-weight: bold;
    }

    .msg-info-time {
        font-size: 0.85em;
    }

    .left-msg .msg-bubble {
        border-bottom-left-radius: 0;
        // Semi-transparent white background
    }

    .right-msg {
        flex-direction: row-reverse;
        background-color: rgba(
            255,
            255,
            255,
            0
        ); // Semi-transparent white background
    }

    .left-msg {
        background-color: rgba(255, 255, 255, 0);
    }

    .right-msg .msg-bubble {
        background: 579ffb;
        // color: #fff;
        border-bottom-right-radius: 0;
    }

    .right-msg .msg-img {
        margin: 0 0 0 10px;
    }

`;

export { TalkDiv, TalkBox };

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import {
    Message,
    appendMessage,
    TalkBoxState,
} from "../../stores/talkBoxSlice";
import TranslationBox from "../TranslationBox";
import store from "../../stores";
import { setText } from "../../stores/translationSlice";

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
    const [selectedText, setSelectedText] = useState<string | null>(null); // Add this state
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);


    useEffect(() => {
        if (msgerChatRef.current) {
            msgerChatRef.current.scrollTop = msgerChatRef.current.scrollHeight;
        }
    }, [messages]);

    // const appendMessageToState = (
    //     playerId: string,
    //     name: string,
    //     img: string,
    //     side: string,
    //     text: string
    // ) => {
    //     const newMessage: Message = { playerId, name, img, side, text };
    //     dispatch(appendMessage(newMessage)); // Redux action
    // };

    const formatDate = (date: Date) => {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();

        return `${h.slice(-2)}:${m.slice(-2)}`;
    };
    const handleMouseUp = (e: React.MouseEvent) => {
        console.log("handleMouseUp");
        const selection = window.getSelection();
        if (selection) {
            const selectedText = selection.toString();
            console.log(selectedText);
            setSelectedText(selectedText); // Save selected text to state
            setMousePosition({ x: e.clientX, y: e.clientY });  // Set mouse position
        }
    };
    const handleMouseDown = (e: React.MouseEvent) => {
        console.log("handleMouseDown");
        setSelectedText(null); // Reset selected text
        store.dispatch(setText("번역 중입니다......")); // Reset translation
        setDragStart({ x: e.clientX, y: e.clientY });
    };


    return (
        <TalkDiv>
            <section className="msger">
                {/* <header className="msger-header">
                <div className="msger-header-title">
                    <i className="fas fa-comment-alt"></i> NPCDialog
                </div>
                <div className="msger-header-options">
                    <span>
                        <i className="fas fa-cog"></i>
                    </span>
                </div>
            </header> */}
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

                                <div className="msg-text" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>{message.text}</div>
                            </div>
                        </div>
                    ))}
                </main>
                {/* Add TranslationBox component here */}
                {selectedText && dragStart && <TranslationBox text={selectedText} position={dragStart} onOut={() => setSelectedText(null)} />}
                {/* { */}
                {/* // </form>} */}
            </section>
        </TalkDiv>
    );
};
export default TalkBox;

const TalkDiv = styled.div`
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
        margin: 25px 10px;
        width: 45vw;
        height: 90vh;
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
        width: 50px;
        height: 50px;
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
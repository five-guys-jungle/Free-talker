import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { appendMessage, TalkBoxState } from "../../stores/talkBoxSlice";

interface Message {
    name: string;
    img: string;
    side: string;
    text: string;
}

const BOT_MSGS = [
    "Hi, how are you?",
    "Ohh... I can't understand what you're trying to say. Sorry!",
    "I like to play games... But I don't know how to play!",
    "Sorry if my answers are not relevant. :))",
    "I feel sleepy! :(",
];

const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = "Sajad";

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

    useEffect(() => {
        if (msgerChatRef.current) {
            msgerChatRef.current.scrollTop = msgerChatRef.current.scrollHeight;
        }
    }, [messages]);

    // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //   event.preventDefault();

    //   const msgText = msgerInputRef.current?.value;
    //   if (!msgText) return;

    //   appendMessageToState(PERSON_NAME, PERSON_IMG, "right", msgText);
    //   msgerInputRef.current!.value = "";

    //   botResponse();
    // };

    const appendMessageToState = (
        name: string,
        img: string,
        side: string,
        text: string
    ) => {
        const newMessage: Message = { name, img, side, text };
        dispatch(appendMessage(newMessage)); // Redux action
    };

    // const botResponse = () => {
    //   const r = random(0, BOT_MSGS.length - 1);
    //   const msgText = BOT_MSGS[r];
    //   const delay = msgText.split(" ").length * 100;

    //   setTimeout(() => {
    //     appendMessageToState(BOT_NAME, BOT_IMG, "left", msgText);
    //   }, delay);
    // };

    const formatDate = (date: Date) => {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();

        return `${h.slice(-2)}:${m.slice(-2)}`;
    };

    // const random = (min: number, max: number) => {
    //   return Math.floor(Math.random() * (max - min) + min);
    // };

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
                                    backgroundImage: `url(${message.img})`,
                                }}
                            ></div>

                            <div className="msg-bubble">
                                <div className="msg-info">
                                    <div className="msg-info-name">
                                        {message.name}
                                    </div>
                                    {/* <div className="msg-info-time">
                                        {formatDate(new Date())}
                                    </div> */}
                                </div>

                                <div className="msg-text">{message.text}</div>
                            </div>
                        </div>
                    ))}
                </main>
                {/* <form className="msger-inputarea" onSubmit={handleSubmit}>
          <input
            type="text"
            className="msger-input"
            placeholder="Enter your message..."
            ref={msgerInputRef}
          />
          <button type="submit" className="msger-send-btn">
            Send
          </button>
        </form> */}
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
        max-width: 450px;
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

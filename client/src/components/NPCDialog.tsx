import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import TalkBox from "./npcdialog/TalkBox";
import SentenceBox from "./npcdialog/SentenceBox";
import Record from "./npcdialog/Record";
import store from "../stores";
import { setText } from "../stores/translationSlice";
import TranslationBox from "./TranslationBox";


const TalkContainer = styled.div`
    display: flex;
    // height: 100%;
    position: absolute;
    height: 100%;
    width: 100%; // added
`;

const LeftSection = styled.section`
    display: flex;
    flex-direction: column;
    height: 100%;
    // padding: 0 5%; /* 화면 양쪽에 5% 공간을 추가 */
    width: 50vw;
    padding: 0;
    margin: 0;
    // flex: 1;
    // flex-direction: column;
    // // justify-content: space-between;
    // // align-items: center;
    background-color: rgba(
        255,
        255,
        255,
        0.8
    ); // Semi-transparent white background
`;

const UpperSection = styled.div`
    flex: 7;
    height:100%;
    
    // padding: 0 5%; /* 화면 양쪽에 5% 공간을 추가 */
    // @media (min-width: 600px) {
    //     padding: 0 10%;  /* 화면 너비가 600px 이상일 때 양쪽에 10% 공간을 추가 */
    // }

    // @media (min-width: 1200px) {
    //     padding: 0 15%;  /* 화면 너비가 1200px 이상일 때 양쪽에 15% 공간을 추가 */
    // }
    // justify-content: space-between;
    // align-items: center;
    rgba(
        255,
        255,
        255,
        0.8
    // border-bottom: 1px solid #ddd;
`;

const LowerSection = styled.div`
    flex: 3;
    height:100%;
    rgba(
        255,
        255,
        255,
        0.8
    // border-top: 1px solid #ddd;
`;

const RightSection = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;

    flex: 1;
    height: 100%;
    width: 50vw;
    background-color: rgba(
        255,
        255,
        255,
        0.8
    ); // Semi-transparent white background
`;

const NPCDialog: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const [selectedText, setSelectedText] = useState<string | null>(null); // Add this state
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);

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


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue !== "") {
            setMessages([...messages, inputValue]);
            setInputValue("");
        }
    };

    return (
        <TalkContainer
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <LeftSection>
                <UpperSection>
                    <SentenceBox />
                </UpperSection>
                <LowerSection>
                    <Record />
                </LowerSection>
            </LeftSection>
            <RightSection>
                <TalkBox />
            </RightSection>
            {selectedText && dragStart && <TranslationBox text={selectedText} position={dragStart} onOut={() => setSelectedText(null)} />}
        </TalkContainer>
    );
};

export default NPCDialog;

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
`;

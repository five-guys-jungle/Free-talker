import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import TalkBox from "./npcdialog/TalkBox";
import SentenceBox from "./npcdialog/SentenceBox";
import Record from "./npcdialog/Record";

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
        0.5
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
        0.5
    // border-bottom: 1px solid #ddd;
`;

const LowerSection = styled.div`
    flex: 3;
    
    rgba(
        255,
        255,
        255,
        0.5
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
        0.5
    ); // Semi-transparent white background
`;

const NPCDialog: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

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
        <TalkContainer>
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

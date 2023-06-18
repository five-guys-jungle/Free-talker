import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import TalkBox from "../components/npcdialog/TalkBox";
import SentenceBox from "../components/npcdialog/SentenceBox";
import Record from "../components/npcdialog/Record";

const TalkContainer = styled.div`
  display: flex;
  height: 100%;
`;

const LeftSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const UpperSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
`;

const LowerSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-top: 1px solid #ddd;
`;

const RightSection = styled.section`
  flex: 1;
`;

const NpcDialog: React.FC = () => {
  
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
          <SentenceBox/>
        </UpperSection>
        <LowerSection>
          <Record/>
        </LowerSection>
      </LeftSection>
      <RightSection>
        <TalkBox />
      </RightSection>
    </TalkContainer>
  );
};

export default NpcDialog;

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
`;

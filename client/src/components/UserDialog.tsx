import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import SituationBox from "./userdialog/SituationBox";
import ScriptBox from "./userdialog/ScriptBox";
import UserBox from "./userdialog/UserBox";
import RTCaudio from "./userdialog/RTCaudio";

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  );
  // background-image: url("./assets/logo/logo_transparent.png");
  // background-size: 100% 100%;
  `;

const LeftSection = styled.section`
  flex: 1;
  height: 100%;
`;

const UpperSection = styled.div`
  flex: 0.3;

  // border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 50vh; // Set height to half of the Container height
  box-sizing: border-box;
`;

const LowerSection = styled.div`
  flex: 0.7;

  // border-top: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 50vh; // Set height to half of the Container height
  box-sizing: border-box;
`;

const RightSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  
`;

const UserDialog: React.FC = () => {
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
    <Container>
      <LeftSection>
        <RTCaudio />
        <UserBox />
      </LeftSection>
      <RightSection>
        <UpperSection>
          <SituationBox />
        </UpperSection>
        <LowerSection>
          <ScriptBox />
        </LowerSection>
      </RightSection>
    </Container>
  );
};

export default UserDialog;

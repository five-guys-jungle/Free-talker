import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import RecommendBox from "./userdialog/RecommendBox";
import VocaBox from "./userdialog/VocaBox";

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const LeftSection = styled.section`
  flex: 1;
`;

const UpperSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px; /* Added */
  box-sizing: border-box; /* Added */
`;

const LowerSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px; /* Added */
  box-sizing: border-box; /* Added */
`;

const RightSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 0, 255, 0.9);
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
      <LeftSection></LeftSection>
      <RightSection>
        <UpperSection>
          <RecommendBox />
        </UpperSection>
        <LowerSection>
          <VocaBox />
        </LowerSection>
      </RightSection>
    </Container>
  );
};

export default UserDialog;

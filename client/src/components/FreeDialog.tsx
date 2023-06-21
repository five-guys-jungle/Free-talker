import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import RecommendBox from "./userdialog/RecommendBox";
import VocaBox from "./userdialog/VocaBox";
import UserBox from "./userdialog/UserBox";
import RTC from "./freedialog/RTC";
const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const LeftSection = styled.section`
  flex: 1;
  height: 100%;
  overflow: auto;
`;

const UpperSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 50vh; // Set height to half of the Container height
  box-sizing: border-box;
`;

const LowerSection = styled.div`
  flex: 1;
  background-color: #fff;
  border-top: 1px solid #ddd;
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

const FreeDialog: React.FC = () => {
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
        <UserBox />
      </LeftSection>
      <RightSection>
	  	<RTC/>
      </RightSection>
    </Container>
  );
};

export default FreeDialog;

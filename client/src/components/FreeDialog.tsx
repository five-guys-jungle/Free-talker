import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import FreeUserBox from "./freedialog/FreeUserBox";
import RTC from "./freedialog/RTC";

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(
    255,
    255,
    255,
    0.5
);
  background-image: url("./assets/backgrounds/park.jpg");
  background-size: 100% 100%;
  `;

const LeftSection = styled.section`
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: rgba(255, 255, 255, 0.7);
`;



const RightSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
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
        <FreeUserBox />
      </LeftSection>
      <RightSection>
	  	  <RTC/>
      </RightSection>
    </Container>
  );
};

export default FreeDialog;

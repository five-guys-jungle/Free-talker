import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import TalkBox from "../components/npcdialog/TalkBox";

const TalkContainer = styled.div`
  display: flex;
  height: 100%;
`;

const MessageContainer = styled.div`
  /* 메시지를 표시하는 컨테이너의 스타일을 지정합니다. */
`;

const InputContainer = styled.div`
  /* 입력 필드와 전송 버튼을 포함하는 컨테이너의 스타일을 지정합니다. */
`;

const TalkBoxContainer = styled.div`
  flex: 1;
`;

const NpcDialog: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue !== '') {
      setMessages([...messages, inputValue]);
      setInputValue('');
    }
  };

  return (

        <TalkBox />

  );
};

export default NpcDialog;

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
`;

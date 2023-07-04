import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
import store from "../stores";
import { setText } from "../stores/translationSlice";

interface TranslationBoxProps {
    text: string;
    position: { x: number, y: number };
    onOut: () => void;
}

const TranslationBox: React.FC<TranslationBoxProps> = ({ text, position, onOut }) => {
    const translation = useSelector((state: any) => state.translationBox.translataion);
    const [translationBtnClicked, setTranslationBtnClicked] = useState<boolean>(false); // Add this state

    useEffect(() => {
        console.log("TranslationBox component mounted");
        return () => {
            console.log("TranslationBox component unmounted");
            setTranslationBtnClicked(false);
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Your code...
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Your code...
    };

    const translationLines = translation.split('\n'); // '\n'으로 문자열 분리

    const clearTranslation = () => {
        store.dispatch(setText("번역 중입니다......"));
    };

    // 커스텀 이벤트를 발생시키는 함수
    const handleTranslateClick = () => {
        setTranslationBtnClicked(true);
        if (text !== "") {
            const translationEvent = new CustomEvent('translationEvent', {
                detail: {
                    message: text,
                }
            });
            // 이벤트 발생
            window.dispatchEvent(translationEvent);
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                // border: '1px solid black',
                backgroundColor: 'skyblue',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'fit-content',
                borderRadius: '15px',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {/* <CloseButton onClick={() => { onOut(); clearTranslation(); }}>X</CloseButton> */}
            <Text1>{text}</Text1>
            {!translationBtnClicked && <TranslateButton onClick={handleTranslateClick}>번역 하기</TranslateButton>}
            {translationBtnClicked && translationLines.map((line: string, index: number) => <Text2 key={index}>{line}</Text2>)}
        </div>
    );
};

export default TranslationBox;

const Text1 = styled.p`
  margin-bottom: 10px;
  font-weight: bold;
`;
const Text2 = styled.p`
  margin-bottom: 10px;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 3px;
  padding: 10px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
const TranslateButton = styled.button`
  /* 버튼의 스타일링을 여기에 추가하세요. 예를 들면: */
  padding: 10px;
  background-color: lightgreen;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: green;
  }
`;
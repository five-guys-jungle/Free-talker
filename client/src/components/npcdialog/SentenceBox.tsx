import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Sentence, SentenceBoxState, setCanRequestRecommend } from "../../stores/sentenceBoxSlice";
import { setRecord } from "../../stores/recordSlice";
import { RecordState } from "../../stores/recordSlice";
import { TalkBoxState } from "../../stores/talkBoxSlice";
import { css, keyframes } from 'styled-components';
import TranslationBox from "../TranslationBox";
import store from "../../stores";
import { setText } from "../../stores/translationSlice";

interface SentenceViewProps {
    sentence: Sentence;
}

const SentenceView: React.FC<SentenceViewProps> = ({ sentence }) => {
    const { sentence: sentenceText } = sentence;

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

    return (
        <SentenceDiv>
            <div className="sentence">
                <div className="field">
                    {/* <span className="label">추천문장: </span> */}
                    <span
                        className="value"
                        onMouseDown={handleMouseDown} 
                        onMouseUp={handleMouseUp}
                    >{sentenceText}</span>
                </div>
            </div>
            {selectedText && dragStart && <TranslationBox text={selectedText} position={dragStart} onOut={() => setSelectedText(null)} />}
        </SentenceDiv>
    );
};

const SentenceList: React.FC = () => {
    const initialValues: Sentence[] = [];
    const dispatch = useDispatch();
    const sentences = useSelector(
        (state: { sentenceBox: SentenceBoxState }) =>
            state.sentenceBox.sentences
    );
    const canRequestRecommend = useSelector(
        (state: { sentenceBox: SentenceBoxState }) =>
            state.sentenceBox.canRequestRecommend
    );
    const talkBoxMessages = useSelector(
        (state: { talkBox: TalkBoxState }) => state.talkBox.messages
    );
    const record = useSelector((state: { record: RecordState }) => state.record.record);

    const [isLongPress, setIsLongPress] = useState(false);
    const [isOuterDivVisible, setIsOuterDivVisible] = useState(true);

    const handleToggleOuterDiv = () => {
        setIsOuterDivVisible((prev) => !prev);
    };

    const handleClick = () => {
        console.log("handleClick");
        // handleToggleOuterDiv();
        if (canRequestRecommend) {
            const lastMessage = talkBoxMessages[talkBoxMessages.length - 1].text;
            const clickEvent = new CustomEvent('recomButtonClicked', {
                detail: { message: sentences.length, lastMessage: lastMessage }
            });
            window.dispatchEvent(clickEvent);
        }
        // if (!isOuterDivVisible && !record) {
        //     // dispatch(setRecord(true));            
        // }

    };

    useEffect(() => {
        if (record) {
            const timer = setTimeout(() => {
                setIsLongPress(true);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setIsLongPress(false);
        }
    }, [record]);


    const sentenceViews = sentences.map((sentence) => (
        <SentenceView key={sentence._id} sentence={sentence} />
    ));

    return (
        <div className="container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", fontFamily: "Poppins" }}>
            <DialogTitle>Try freetalking with NPC</DialogTitle>

            {isOuterDivVisible && (
                <SentenceOuterDiv>{sentenceViews}</SentenceOuterDiv>
            )}
            <AdditionalText>녹음 시작/끝 : <span style={{ color: "#C70039", fontWeight: "bold" }}>D</span><Space></Space> 대화스킵 : <span style={{ color: "#C70039", fontWeight: "bold" }}>S</span><Space></Space>대화종료 : <span style={{ color: "#C70039", fontWeight: "bold" }}>E</span> </AdditionalText>
            {canRequestRecommend && (
                <Button onClick={handleClick} isOpen={isOuterDivVisible} longPress={isLongPress} style={{ position: "absolute" }}>
                    추천 문장 보기
                </Button>)}
        </div>
    );
};

const SentenceBox: React.FC = () => {
    return <SentenceList />;
};

export default SentenceBox;

const DialogTitle = styled.h1`
    font-size: 3vw;
    flex: none;
    text-align: center; // This will center the text
    color: #2d3748; // Adjust this as needed
    padding: -10px auto; // Adjust this as needed
    margin-bottom: 20px; // Adjust this as needed
`;

const blinking = keyframes`
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
`;

const Button = styled.button<{ isOpen: boolean; longPress: boolean }>`
    background-color: ${({ isOpen, longPress }) =>
        isOpen ? '#3182ce' : longPress ? '#ee3823' : '#3182ce'};
    font-size: 25px; // 글자 크기 조정
    color: #fff;
    border: none;
    padding: 20px 30px;
    border-radius: 90px;
    // margin-bottom: 10px;
    // margin-left: 30px;
    cursor: pointer;
    font-family: 'MaplestoryOTFLight';

    ${({ longPress, isOpen }) =>
        longPress && !isOpen &&
        css`
            animation: ${blinking} 1.5s infinite;
        `}
`;

const SentenceOuterDiv = styled.div`
    display: flex; // Add this
    background-color: #c1bdbd;
    flex: 1;
    width: 40vw;
    height: 50vh;
    margin: 5px auto 10px;
    flex-direction: column; // Add this
    padding: 0 0%; /* 화면 양쪽에 10% 공간을 추가 */
    justify-content: center;
    // align-items: center;
    // padding-bottom: 10%;
    // @media (min-width: 600px) {
    // padding: 0 0%; /* 화면 너비가 600px 이상일 때 양쪽에 10% 공간을 추가 */
    // }

    // @media (min-width: 1200px) {
    // padding: 0 15%; /* 화면 너비가 1200px 이상일 때 양쪽에 15% 공간을 추가 */
    // }
    opacity: 0.7;
    border-radius: 8px;
`;
// 추가 텍스트를 위한 styled-component 생성
const AdditionalText = styled.div`
    font-size: 1.2rem;  // 원하는 텍스트 크기로 설정하세요.
    margin-left: -35%;  // 원하는 간격으로 조정하세요.
    font-family: 'MaplestoryOTFLight';

`;
const Space = styled.span`
    margin-left: 25px;  // 원하는 간격으로 조정하세요.

`;
const SentenceDiv = styled.div`
    body {
        // padding: 0 10%;
        // color: #2d3748;
        // font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        // Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    .container {
        display: flex; // Add this
        flex-direction: column; // Add this
        justify-content: center; // Add this
        align-items: center; // Add this
        width: 100% // Adjust this
        height: 100%;
        margin: 0 auto;
        overflow: auto;
    }


    .sentence {
        background-color: #f7fafc;
        // width: fit-content; // Adjust this
        opacity: 1.0;
        // width: 600px;
        height: 7vh;
        width: 32vw;
        margin: 2vh auto;
        // margin: 0 auto; // Adjust this
        border-top: solid 2px #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        overflow: auto;
    }

    .field {
        display: flex;
        justify-content: flex-start;
        margin-top: 4px;
    }

    // .sentence-outerdiv {
    //     display: flex; // Add this
    //     background-color: #c1bdbd;
    //     align-items: center; // Add this
    //     flex-direction: column; // Add this
    //     border-radius: 8px;
    // }

    .label {
        font-weight: bold;
        font-size: 1rem;
        width: 6rem;
    }

    .value {
        color: #4a5568;
        font-size: 2.5vh;
    }

    .text .value {
        font-style: italic;
    }
`;


// .sentence {
//     background-color: #f7fafc;
//     width: 600px;
//     height: 150px;
//     margin-top: 20px;
//     border-top: solid 2px #fff;
//     border-radius: 8px;
//     padding: 20px;
//     box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
//         0 4px 6px -2px rgba(0, 0, 0, 0.05);
// }

// .container {
//     width: 600px;
//     height: 150px;
//     margin: 0 auto;
// }

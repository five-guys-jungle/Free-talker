import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Sentence, SentenceBoxState, setCanRequestRecommend } from "../../stores/sentenceBoxSlice";
import { setRecord } from "../../stores/recordSlice";
import { RecordState } from "../../stores/recordSlice";
import { TalkBoxState } from "../../stores/talkBoxSlice";
import { css, keyframes } from 'styled-components';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

interface SentenceViewProps {
    sentence: Sentence;
}

const SentenceView: React.FC<SentenceViewProps> = ({ sentence }) => {
    const { sentence: sentenceText, audioUrl, isTTSLoading } = sentence;
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false); // 버튼이 비활성화되었는지를 나타내는 상태
    const [isCanPlay, setIsCanPlay] = useState<boolean>(false); // 재생 요청이 들어왔는지 나타내는 상태


    const requestTTS = (sentenceObject: Sentence) => {
        if (isButtonDisabled) { // 만약 버튼이 비활성화 상태라면
            return; // 아무 작업도 수행하지 않고 함수를 종료합니다.
        }
        setIsButtonDisabled(true); // 버튼을 비활성화 상태로 변경합니다.

        const clickEvent = new CustomEvent('requestTTS', {
            detail: { sentence: sentenceObject.sentence, id: sentenceObject._id }
        });
        console.log("window dispatch event");
        window.dispatchEvent(clickEvent);
    };

    const audioReplaying = () => {
        if (currentAudio) {
            currentAudio.play();
        } else {
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                // setIsButtonDisabled(false);
                setCurrentAudio(null);
            };
            audio.play();
            setCurrentAudio(audio);
        }
    };

    const pauseAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
        }
    }

    useEffect(() => {
        console.log(`audioUrl: ${audioUrl}`)
        if (audioUrl) {
            console.log(`In If statement, audioUrl: ${audioUrl}`);
            setIsCanPlay(true);
            const audio = new Audio(audioUrl);
            audio.onended = () => {
                // setIsButtonDisabled(false);
                setCurrentAudio(null)
            };
            audio.play();
            setCurrentAudio(audio);
        }

        return () => {
        }

    }, [audioUrl]);


    return (
        <SentenceDiv>
            <div className="sentence">
                <div className="field">
                    {/* <span className="label">추천문장: </span> */}
                    <span
                        className="value">{sentenceText}</span>
                    {
                        (audioUrl !== "") && currentAudio && currentAudio.src === audioUrl ?
                            <PauseIcon onClick={pauseAudio} /> : (audioUrl !== "") ?
                            <PlayArrowIcon onClick={isButtonDisabled ? audioReplaying : () => requestTTS(sentence)} /> : <></>
                    }
                </div>
            </div>
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
    const NPCName = useSelector(
        (state: { talkBox: TalkBoxState }) =>
            state.talkBox.messages[0]?.name
    );
    return (
        <div className="container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", fontFamily: "Poppins" }}>
            <DialogTitle>freetalk to the {NPCName || "NPC"} </DialogTitle>

            {isOuterDivVisible && (
                <SentenceOuterDiv>{sentenceViews}</SentenceOuterDiv>
            )}
            <AdditionalText>녹음 시작/끝 : <span style={{ color: "#C70039", fontWeight: "bold" }}>D</span><Space></Space> 대화스킵 : <span style={{ color: "#C70039", fontWeight: "bold" }}>S</span><Space></Space>대화종료 : <span style={{ color: "#C70039", fontWeight: "bold" }}>E</span> </AdditionalText>
            {canRequestRecommend && (
                <Button
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onClick={handleClick} isOpen={isOuterDivVisible} longPress={isLongPress} style={{ position: "absolute" }}>
                    추천 문장 보기
                </Button>)}
        </div>
    );
};

const SentenceBox: React.FC = () => {
    return <SentenceList />;
};

const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // 여기에 추가적인 로직을 넣을 수 있습니다.
};

const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // 여기에 추가적인 로직을 넣을 수 있습니다.
};


export default SentenceBox;

const DialogTitle = styled.h1`
    font-size: 2.5vw;
    flex: none;
    text-align: center; // This will center the text
    color: #2d3748; // Adjust this as needed
    padding: -10px auto; // Adjust this as needed
    margin-bottom: 15px; // Adjust this as needed
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
    margin: 5px auto;
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
    font-size: 1.2rem;  
    margin: auto;  
    font-family: 'MaplestoryOTFLight';

`;
const Space = styled.span`
    margin-left: 25px;  

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
        display: flex;
        opacity: 1.0;
        // width: 600px;
        height: auto;
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
        align-items: center;
        margin-top: 4px;
    }


    .label {
        font-weight: bold;
        font-size: 1rem;
        width: 6rem;
    }

    .value {
        color: #4a5568;
        font-size: 2.2vh;
    }

    .text .value {
        font-style: italic;
    }
`;


import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Sentence, SentenceBoxState } from "../../stores/sentenceBoxSlice";

interface SentenceViewProps {
    sentence: Sentence;
}

const SentenceView: React.FC<SentenceViewProps> = ({ sentence }) => {
    const { sentence: sentenceText } = sentence;

    return (
        <SentenceDiv>
            <div className="sentence">
                <div className="field">
                    {/* <span className="label">추천문장: </span> */}
                    <span className="value">{sentenceText}</span>
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

    const sentenceViews = sentences.map((sentence) => (
        <SentenceView key={sentence._id} sentence={sentence} />
    ));

    return (
        <div className="container" style={{ height: "80%" }}>
            <DialogTitle>You can say something like this</DialogTitle>
            <SentenceOuterDiv>{sentenceViews}</SentenceOuterDiv>
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

const SentenceOuterDiv = styled.div`
    display: flex; // Add this
    background-color: #c1bdbd;
    flex: 1;
    width: 30vw;
    height: 100%;
    margin: 0 auto;
    flex-direction: column; // Add this
    padding: 0 10%; /* 화면 양쪽에 10% 공간을 추가 */
    justify-content: center;
    // align-items: center;
    // padding-bottom: 10%;
    // @media (min-width: 600px) {
    // padding: 0 10%; /* 화면 너비가 600px 이상일 때 양쪽에 10% 공간을 추가 */
    // }

    // @media (min-width: 1200px) {
    // padding: 0 15%; /* 화면 너비가 1200px 이상일 때 양쪽에 15% 공간을 추가 */
    // }
    opacity: 0.7;
    border-radius: 8px;
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
    }


    .sentence {
        background-color: #f7fafc;
        // width: fit-content; // Adjust this

        // width: 600px;
        height: 45px;
        margin: 20px auto;
        // margin: 0 auto; // Adjust this
        border-top: solid 2px #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
        font-size: 1.2rem;
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

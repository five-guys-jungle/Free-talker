import React from "react";
import styled from "styled-components";

interface Message {
    _id: string;
    sentence: string;
}

interface MessageViewProps {
    message: Message;
}

const MessageView: React.FC<MessageViewProps> = ({ message }) => {
    const { sentence } = message;

    return (
        <SentenceDiv>
            <div className="message">
                <div className="field">
                    <span className="label">추천문장: </span>
                    <span className="value">{sentence}</span>
                </div>
            </div>
        </SentenceDiv>
    );
};

const MessageList: React.FC = () => {
    const initialValues: Message[] = [
        {
            _id: "d2504a54",
            sentence: "The event will start next week",
        },
        {
            _id: "fc7cad74",
            sentence: "I will be traveling soon",
        },
        {
            _id: "876ae642",
            sentence: "Talk later. Have a great day!",
        },
    ];

    const messageViews = initialValues.map((message) => (
        <MessageView key={message._id} message={message} />
    ));

    return (
        <div className="container">
            <DialogTitle>You can say something like this</DialogTitle>
            <SentenceOuterDiv>
                {messageViews}
                {/* <div className="messageContainer">{messageViews}</div> */}
            </SentenceOuterDiv>
        </div>
    );
};

const SentenceBox: React.FC = () => {
    return <MessageList />;
};

export default SentenceBox;

const DialogTitle = styled.h1`
    font-size: 3vw;
    text-align: center; // This will center the text
    color: #2d3748; // Adjust this as needed
    padding: 0px auto; // Adjust this as needed
    // margin-bottom: 20px; // Adjust this as needed
`;

const SentenceOuterDiv = styled.div`
    display: flex; // Add this
    background-color: #c1bdbd;
    // align-items: center; // Add this
    flex-direction: column; // Add this
    padding: 0 5%; /* 화면 양쪽에 5% 공간을 추가 */
    @media (min-width: 600px) {
        padding: 0 10%; /* 화면 너비가 600px 이상일 때 양쪽에 10% 공간을 추가 */
    }

    @media (min-width: 1200px) {
        padding: 0 15%; /* 화면 너비가 1200px 이상일 때 양쪽에 15% 공간을 추가 */
    }
    opacity: 0.5;
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
        // height: 50%;
        margin: 0 auto;
    }

    // .messageContainer {
    // display: flex; // Add this
    // background-color: #837c7c
    // opacity: 0.5;
    // flex-direction: column; // Add this
    // justify-content: center; // Add this
    // align-items: center; // Add this
    // }

    .message {
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

// .message {
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

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
      <h1>List of Messages</h1>
      {messageViews}
    </div>
  );
};

const SentenceBox: React.FC = () => {
  return <MessageList />;
};

export default SentenceBox;



const SentenceDiv = styled.div`
body {
    background-color: #edf2f7;
    color: #2d3748;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .container {
    width: 400px;
    margin: 0 auto;
  }
  
  .message {
    background-color: #f7fafc;
    width: 400px;
    margin-top: 20px;
    border-top: solid 2px #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .field {
    display: flex;
    justify-content: flex-start;
    margin-top: 2px;
  }
  
  .label {
    font-weight: bold;
    font-size: 1rem;
    width: 6rem;
  }
  
  .value {
    color: #4a5568;
  }
  
  .text .value {
    font-style: italic;
  }
  
`;
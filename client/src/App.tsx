import React from "react";
import logo from "./logo.svg";
import "./App.css";
import GameComponent from "./PhaserGame";
import styled from "styled-components";
// import SignUpDialog from "./components/SignUpDialog";
import LoginDialog from "./components/LoginDialog";
import bgImage from "./assets/images/frame2.jpeg";

function App() {
    return (
        <div className="App">
            <StartDiv>
                <LoginDialog />
                {/* <GameComponent /> */}
            </StartDiv>
        </div>
    );
}

export default App;

const StartDiv = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 50px;
    // background-image: url(${bgImage}); // 배경 이미지를 설정
    // background-size: cover; // 이미지를 가능한 크게, 단 비율은 유지
    // background-position: center; // 배경 이미지의 위치를 중앙으로 설정
`;

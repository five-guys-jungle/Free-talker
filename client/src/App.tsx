import React from "react";
import logo from "./logo.svg";
import "./App.css";
import styled from "styled-components";
import LoginDialog from "./components/LoginDialog";
import NpcDialog from "./pages/NpcDialog";
import TalkBox from "./components/npcdialog/TalkBox";
import bgImage from "./assets/images/frame2.jpeg";
import Game from "./components/Game";

import type { RootState } from './stores';
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.
import { Dialog } from "@mui/material";
// import { selectGameScene } from "./redux/gameSlice"; // Redux에서 gameScene 상태를 선택하는 selector를 불러옵니다.
console.log("status11111111111111111111");
function App() {
    const {  status} = useSelector((state: RootState) => {
        return { ...state.user, ...state.mode };
    });
    console.log("status:", status);
    return (
        <div className="App">
            <StartDiv>
                {/* {status === "login" && <LoginDialog />}
                {status === "airport" && <Game />} */}
                <NpcDialog />
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
`;


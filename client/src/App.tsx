import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import styled from "styled-components";
import LoginDialog from "./components/LoginDialog";
import bgImage from "./assets/images/frame2.jpeg";
import { Game } from "./components/Game";
import type { RootState } from "./stores";
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.
import { GAME_STATUS } from "./stores/gameSlice";
import Start from "./components/StartPage";
// import { selectGameScene } from "./redux/gameSlice"; // Redux에서 gameScene 상태를 선택하는 selector를 불러옵니다.
import NPCDialog from "./components/NPCDialog";
import UserDialog from "./components/UserDialog";
import { Dialog } from "@mui/material";
import TalkBox from "./components/npcdialog/TalkBox";
import FreeDialog from "./components/FreeDialog";
import RTC from "./components/freedialog/RTC";
function App() {
    const { START, AIRPORT, USA, NPCDIALOG, USERDIALOG, LOGIN, FREEDIALOG, REPORT } = GAME_STATUS;
    const { userLoginId, playerId, mode } = useSelector((state: RootState) => {
        return { ...state.user, ...state.mode };
    });

    const dispatch = useDispatch();
    const [logined, setLogined] = useState(false);
    useEffect(() => {
        if (mode !== START && mode !== LOGIN) {
            if (logined) return;
            setLogined(true);
        }
    }, [mode]);

    return (
        <HoverDiv>
            {/* {mode === START || mode === LOGIN ? (
                !logined && <Start />
            ) : mode === AIRPORT ||
              mode === USA ||
              mode === NPCDIALOG ||
              mode === USERDIALOG ||
              mode === REPORT || 
              mode === FREEDIALOG ? (
                <Game />
            ) : (
                <></>
            )} */}
            {/* <NPCDialog/> */}
            {/* <UserDialog /> */}
            <FreeDialog />
            {/* <RTC /> */}
        </HoverDiv>
    );
}

export default App;

const HoverDiv = styled.div`
    position: absolute;
    height: 100%;
    width: 100%;
    // overflow: hidden;
`;

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
import Bgm from "./components/Bgm"

function App() {
    const { START, AIRPORT, USA, NPCDIALOG, USERDIALOG, LOGIN, FREEDIALOG, REPORT } = GAME_STATUS;
    const { userLoginId, playerId, mode } = useSelector((state: RootState) => {
        return { ...state.user, ...state.mode };
    });

    const dispatch = useDispatch();
    const [logined, setLogined] = useState(false);
    // const isClicked = useSelector((state: { guider: { isClicked: boolean } }) => state.guider.isClicked);
    // const backgroundOpacity = useSelector((state: { guider: { backgroundOpacity: number } }) => state.guider.backgroundOpacity);
    useEffect(() => {
        if (mode !== START && mode !== LOGIN) {
            if (logined) return;
            setLogined(true);
        }
    }, [mode]);

    return (
        <HoverDiv>
            {/* <Bgm/> */}
            {/* {isClicked && <Overlay style={{ opacity: backgroundOpacity }} />} */}
            {mode === START || mode === LOGIN ? (
                <>
                    {<Bgm />}
                    {!logined && <Start />}
                </>
            ) : mode === AIRPORT ||
                mode === USA ||
                mode === NPCDIALOG ||
                mode === USERDIALOG ||
                mode === REPORT ||
                mode === FREEDIALOG ? (
                <>
                    <Game />
                    <Bgm />
                </>


            ) : (
                <></>
            )}
            {/* <NPCDialog/> */}
            {/* <UserDialog /> */}
            {/* <FreeDialog /> */}


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


// const Overlay = styled.div`
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.5);
//     z-index: 999;
// `;
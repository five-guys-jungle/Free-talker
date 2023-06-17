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

function App() {
    const { START, AIRPORT, US, NPCDIALOG, USERDIALOG, LOGIN } = GAME_STATUS;
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
            {mode === START || mode === LOGIN ? (
                !logined && <Start />
            ) : mode === AIRPORT ||
              mode === US ||
              mode === NPCDIALOG ||
              mode === USERDIALOG ? (
                <Game />
            ) : (
                <></>
            )}
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

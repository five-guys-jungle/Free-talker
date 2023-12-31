import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Phaser from "phaser";
import AirPortScene from "../scenes/Airport";
import styled from "styled-components";
import {
    setPlayerId,
    setPlayerNickname,
    setPlayerTexture,
} from "../stores/userSlice";
import {
    selectPlayerId,
    selectPlayerNickname,
    selectPlayerTexture,
} from "../stores/userSlice";

import { GAME_STATUS } from "../stores/gameSlice";
import { RootState } from "../stores";
import NPCDialog from "./NPCDialog";
import UserDialog from "./UserDialog";
import FreeDialog from "./FreeDialog";
import Report from "./Report";
import ReportBook from "./Reportbook";
import KeyGuider from "./KeyGuide";
import Guider from "./Guide";
import LevelButton from './LevelButton';
import { Button } from '@mui/material';

const Game = () => {
    // socket intialization, connection

    const { START, AIRPORT, USA, NPCDIALOG, USERDIALOG, FREEDIALOG, REPORT } = GAME_STATUS;
    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });

    const isClicked = useSelector((state: { guider: { isClicked: boolean } }) => state.guider.isClicked);
    const keyGuideClicked = useSelector((state: { keyGuider: { isClicked: boolean } }) => state.keyGuider.isClicked);
    const backgroundOpacityForGuide = useSelector((state: { guider: { backgroundOpacity: number } }) => state.guider.backgroundOpacity);
    const backgroundOpacityForKeyGuide = useSelector((state: { keyGuider: { backgroundOpacity: number } }) => state.keyGuider.backgroundOpacity);

    const backgroundOpacity = isClicked ? backgroundOpacityForGuide : backgroundOpacityForKeyGuide;

    const { reportonoff } = useSelector((state: RootState) => {
        return { ...state.reportonoff };
    });

    return <BackgroundDiv>
        {(mode === NPCDIALOG && reportonoff === false) && <NPCDialog />}
        {/* {mode === NPCDIALOG && <NPCDialog />} */}
        {mode === USERDIALOG && <UserDialog />}
        {mode === FREEDIALOG && <FreeDialog />}
        {mode === REPORT && <Report />}
        {(mode === AIRPORT || mode === USA) && <ReportBook />}
        {/* {mode !== NPCDIALOG && mode !== USERDIALOG && mode !== FREEDIALOG && ( */}
        <ButtonContainer>
            {(isClicked || keyGuideClicked) && <Overlay style={{ opacity: backgroundOpacity }} />}
            <LevelButton />
            <Guider />
            <KeyGuider />
        </ButtonContainer>
        {/* )} */}

    </BackgroundDiv>;
};

export { Game };

const BackgroundDiv = styled.div`
    width: 100%;
    height: 100%;
    // position: relative;
    // overflow: hidden;
`;

const ButtonContainer = styled.div`
  position: fixed;
  right: 1%; /* Adjust the positioning based on your desired distance from the right edge */
  bottom: 2%; /* Adjust the positioning based on your desired distance from the bottom edge */
  display: flex;
  flex-direction: row;
  gap: 10px; /* Add gap to separate the buttons */
  z-index:3;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;
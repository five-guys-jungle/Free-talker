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

const Game = () => {
    // socket intialization, connection

    const { START, AIRPORT, US, NPCDIALOG } = GAME_STATUS;
    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });

    return <BackgroundDiv>{mode === NPCDIALOG && <NPCDialog />}</BackgroundDiv>;
};

export { Game };

const BackgroundDiv = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
`;

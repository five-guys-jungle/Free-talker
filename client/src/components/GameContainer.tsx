import React from "react";
import { Game } from "./Game";
import { GAME_STATUS } from "../stores/gameSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../stores";

const GameContainer = () => {
    const { START, AIRPORT, USA, NPCDIALOG } = GAME_STATUS;
    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });
    return (
        <>
            {mode === AIRPORT || mode === USA || mode === NPCDIALOG ? (
                <>
                    <Game />
                </>
            ) : (
                <></>
            )}
        </>
    );
};

export default GameContainer;

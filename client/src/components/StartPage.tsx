import { GAME_STATUS } from "../stores/gameSlice";

import LoginDialog from "./LoginDialog";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import styled from "styled-components";

const Start = () => {
    const { START, LOGIN } = GAME_STATUS;
    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });

    return <StartDiv>{mode === LOGIN ? <LoginDialog /> : <></>}</StartDiv>;
};

export default Start;

const StartDiv = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 50px;
`;

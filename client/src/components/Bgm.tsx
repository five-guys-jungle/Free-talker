// import ReactAudioPlayer from 'react-audio-player'; 
import bgms from '../assets/bgm/bgmList';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.
import type { RootState } from "../stores";
import { GAME_STATUS } from "../stores/gameSlice";
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded';
import { bgmOn, bgmOff } from '../stores/bgmOnoffSlice';
import store from "../stores";
import styled from 'styled-components';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const audios = Object.entries(bgms).map(([key, audio]) => ({
    name: key,
    audio,
}));




const theme = createTheme({
    palette: {
        primary: {
            // Purple and green play nicely together.
            main: '#2979ff',
        },
        secondary: {
            main: '#2962ff',
        },
    },
});

const Bgm = () => {

    const { START, AIRPORT, USA, NPCDIALOG, USERDIALOG, LOGIN, FREEDIALOG, REPORT } = GAME_STATUS;
    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });

    const { bgmonoff } = useSelector((state: RootState) => {
        return { ...state.bgmonoff };
    });


    const dispatch = useDispatch();
    useEffect(() => {
    }, [mode]);
    useEffect(() => {
        // console.log(bgmonoff);
    }, [bgmonoff]);

    const handleClick = () => {
        // console.log(bgmonoff);
        if (bgmonoff == true) { store.dispatch(bgmOff()); }
        else { store.dispatch(bgmOn()); }
    }

    return (
        <div style={{ position: "absolute", bottom: '2%', left: '1%', }}>
            {(mode == AIRPORT || mode == USA) &&
                <ThemeProvider theme={theme}>
                    <Box style={{ position: "relative" }}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            top: 0,
                        }}
                    >
                        <StyledFab
                            color="primary"
                            onClick={handleClick}
                        >
                            {bgmonoff && <AudiotrackIcon />}
                            {!bgmonoff && <MusicOffRoundedIcon />}
                        </StyledFab>
                    </Box>
                </ThemeProvider>
            }
            {/* {(mode==START || mode==LOGIN) && <>
        {bgmonoff && <audio id="myAudio" src={audios[0].audio} controls autoPlay loop style={{ display: "none" }}/>}
        {!bgmonoff && <audio id="myAudio" src={audios[0].audio} controls autoPlay muted style={{ display: "none" }}/>}
        </>} */}
            {mode == AIRPORT && <>
                {bgmonoff && <audio src={audios[1].audio} controls autoPlay loop style={{ display: "none" }} />}
                {!bgmonoff && <audio src={audios[1].audio} controls autoPlay muted style={{ display: "none" }} />}
            </>}
            {mode == USA && <>
                {bgmonoff && <audio src={audios[2].audio} controls autoPlay loop style={{ display: "none" }} />}
                {!bgmonoff && <audio src={audios[2].audio} controls autoPlay muted style={{ display: "none" }} />}
            </>}
            {/* {(mode==NPCDIALOG || mode== USERDIALOG || mode==REPORT || mode==FREEDIALOG) && <>
        {bgmonoff &&<audio src={audios[3].audio} controls autoPlay loop style={{  display: "none" }} volume={0.5} />}
        {!bgmonoff &&<audio src={audios[3].audio} controls autoPlay muted style={{  display: "none" }}/>}
        </>} */}
        </div>
        //   <ReactAudioPlayer src="assets/.mp3" autoPlay controls />
    );

}

const StyledFab = styled(Fab)`
    border: 3px ridge ${'#B0C4DE'};
    padding: 2rem;
    color: white;
    background-color: lightskyblue;
    transition: all 0.5s ease;
    &:hover {
        background-color: deepskyblue;
    }
`;

// declare module 'react' {
//     interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
//       volume?: number;
//     }
//   }

export default Bgm;
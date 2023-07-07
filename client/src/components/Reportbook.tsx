import React, { useEffect, useState } from "react";
import store, { RootState, useAppDispatch } from "../stores";
import { openAirport, openUSA, openReportBook } from "../stores/gameSlice";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.
import TalkBox from "./npcdialog/TalkBox";
import { TalkBoxState } from "../stores/talkBoxSlice";
import { correctionState } from "../stores/reportSlice";
import {
    saveDialog,
    deleteDialog,
    loadDialog,
    dialogState,
} from "../stores/saveDialogSlice";
import Button from "@mui/material/Button";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { IconButton } from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { scoreState } from "../stores/scoreSlice";
import { Pagination, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import { GAME_STATUS } from "../stores/gameSlice";
// interface NPCDialogProps {
//     initialDialog?: string;
//     onClose: () => void;
// }
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { orange } from "@mui/material/colors";

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


let dialogsArr: dialogState = {
    dialogs: [],
};

const CustomNavigationButton: React.FC<{ className?: string; onClick?: () => void; direction: "prev" | "next" }> = ({ className, onClick, direction }) => (
    <div>
        {direction === "prev" ? (
            <img className={className} onClick={onClick} src="./assets/UI/arrowLeft.png" alt="Previous" />
        ) : (
            <img className={className} onClick={onClick} src="./assets/UI/arrowRight.png" alt="Next" />
        )}
    </div>
);

const ReportBook = (data: any) => {
    const [openbook, setOpenbook] = useState(false);

    const { presentScene, isButtonClicked } = useSelector((state: RootState) => {
        return { ...state.presentScene };
    });

    const { mode } = useSelector((state: RootState) => {
        return { ...state.mode };
    });

    const { playerId, playerNickname, playerTexture } = useSelector(
        (state: RootState) => {
            return { ...state.user };
        }
    );

    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const playAudio = (audioUrl: string) => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
        }

        const audio = new Audio(audioUrl);
        audio.onended = () => setCurrentAudio(null);
        audio.play();
        setCurrentAudio(audio);
    };

    const pauseAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
        }
    }



    useEffect(() => {
        // console.log(playerId);
        // console.log(playerNickname);
        // console.log(playerTexture);
    }, [playerId, playerNickname, playerTexture]);

    const corrections = useSelector(
        (state: { correction: correctionState }) => state.correction.corrections
    );

    const messages = useSelector(
        (state: { talkBox: TalkBoxState }) => state.talkBox.messages
    );

    let score = useSelector(
        (state: { score: scoreState }) => state.score.score
    );

    let fix_playerTexture = playerTexture;
    // let temp_str=fix_playerTexture.split("");
    // let lowerChar;
    // lowerChar=fix_playerTexture.charCodeAt(0)
    // temp_str[0]=String.fromCharCode(lowerChar-32);
    // fix_playerTexture=temp_str.join("");
    // console.log(fix_playerTexture)

    const imgUrl = "./assets/characters/single/" + fix_playerTexture + ".png";
    // console.log(imgUrl);

    const handleSave = () => {
        // saveDialog({
        //   userId: playerId,
        //   timestamp: `${month[date.getMonth() + 1]} ${date.getDate()}`,
        //   nickname: playerNickname,
        //   npc: messages[1].name,
        //   userTexture: playerTexture,
        //   score: score,
        //   corrections: corrections,
        //   messages: messages,
        // });
        setOpenbook(!openbook);
        if (presentScene == "airport") store.dispatch(openAirport());
        else if (presentScene == "usa") store.dispatch(openUSA());
    };

    // const [refreshKey, setRefreshKey] = useState(0);
    // const handleRefresh = () => {
    //     setRefreshKey(prevKey => prevKey + 1);
    //   };


    const handleDelete = (userId: string, timestamp: string) => {
        deleteDialog({
            userId: userId,
            timestamp: timestamp,
            nickname: "",
            npc: "",
            userTexture: "",
            score: 0,
            corrections: [],
            messages: [],
        });
        // setOpenbook(!openbook);
        if (presentScene=="airport") store.dispatch(openAirport());
        else if (presentScene=="usa") store.dispatch(openUSA());
        // setRefreshKey(prevKey => prevKey + 1);
        // console.log(refreshKey);
        handleBook();
    };

    function isArrayEmpty<T>(arr: T[]): boolean {
        return arr.length === 0;
    }

    const handleBook = async () => {
        let data;

        data = await loadDialog({
            userId: playerId,
            timestamp: `${month[date.getMonth() + 1]} ${date.getDate()}`,
            nickname: playerNickname,
            npc: "",
            userTexture: playerTexture,
            score: 0,
            corrections: [],
            messages: [],
        });
        console.log(data);
        if (data === undefined) {
            // console.log(`data : ${data}`);

            // console.log(openbook);
            setOpenbook(!openbook);

            dialogsArr.dialogs = [];
            // console.log(dialogsArr.dialogs);

            // dialogsArr.dialogs.map((dialog) => console.log(dialog.timestamp));
        } else {
            dialogsArr.dialogs = data;
            // console.log(openbook);
            setOpenbook(!openbook);

            // console.log(dialogsArr.dialogs);

            // dialogsArr.dialogs.map((dialog) => console.log(dialog.timestamp));
        }
        // store.dispatch(openReportBook());
    };

    const date = new Date();
    const month: { [key: number]: string } = {
        1: "January",
        2: "Fabuary",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "Autober",
        11: "November",
        12: "December",
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "absolute" }}>
            <div
                style={{
                    textAlign: "right",
                    marginTop: "20px",
                    marginRight: "20px",
                    position: "absolute",
                    right: "0px"
                }}
            >
                <ThemeProvider theme={theme}>
                    <Button color={isButtonClicked ? "primary" : "secondary"} variant="contained" size="large" onClick={handleBook}
                        style={{ boxShadow: isButtonClicked ? "0px 0px 25px #fff" : "0px 0px 0px #fff" }}>
                        <img
                            src={"./assets/ReportBookIcon.png"}
                            alt={"ReportBook"}
                            style={{ width: "40px" }}
                        ></img>
                        <span
                            style={{
                                marginLeft: "5px",
                                fontFamily: "Lexend Peta",
                                fontWeight: "bolder",
                            }}
                        >
                            여행<br></br>기록
                        </span>
                    </Button>
                </ThemeProvider>
            </div>

            {openbook == true && (
                <SwiperDiv style={{ width: "100%", height: "100%", display: "flex" }}>
                    <Swiper
                        style={{ width: "970px" }}
                        modules={[Navigation]}
                        navigation={{
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}

                        // key={refreshKey}
                    >
                        {dialogsArr.dialogs.length == 0 && (
                            <SwiperSlide >
                                <ReportDiv>
                                    <div className="main-content">
                                        <div className="notebook">
                                            <div className="notebook__inner">
                                                <div className="title">
                                                    <h1>REPORT</h1>
                                                    <IconButton
                                                            color="primary"
                                                            onClick={handleBook}
                                                            style={{
                                                                gridArea: "s3",
                                                                marginLeft:
                                                                    "auto",
                                                                marginTop:
                                                                    "20px",
                                                                width: "50px",
                                                                height: "25px",
                                                            }}
                                                        >
                                                            <DisabledByDefaultIcon/>
                                                        </IconButton>
                                                    <h3>
                                                        &lt; 여행을 떠나보아요!
                                                        &gt;
                                                    </h3>
                                                </div>
                                                <div className="results">
                                                    <div className="results__item">
                                                        <div className="results__name">
                                                            ✔︎ 내 대화는?
                                                        </div>
                                                        <div className="results__list"></div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="Character"
                                                    style={{
                                                        gridColumn: "1/span 2",
                                                        width: "50%",
                                                        margin: "20px auto",
                                                    }}
                                                >
                                                    <h4>My Character</h4>
                                                    <center>
                                                        <ScaleImg
                                                            className="Character__box"
                                                            src={`./assets/characters/single/${fix_playerTexture}.png`}
                                                            alt={
                                                                fix_playerTexture
                                                            }
                                                        ></ScaleImg>
                                                    </center>
                                                    <div className="Nickname">
                                                        <span className="Character__title">
                                                            {playerNickname}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="talks">
                                                    <center>
                                                        <p
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                marginTop:
                                                                    "50%",
                                                                fontSize:
                                                                    "20px",
                                                            }}
                                                        >
                                                            Try talk!
                                                        </p>
                                                    </center>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ReportDiv>
                            </SwiperSlide>
                        )}

                        {dialogsArr.dialogs.map((dialog, index) => (
                            <SwiperSlide key={index}>
                                {
                                    <ReportDiv>
                                        <div className="main-content">
                                            <div className="notebook">
                                                <div className="notebook__inner">
                                                    <div className="title">
                                                        <h1>REPORT</h1>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={handleBook}
                                                            style={{
                                                                gridArea: "s3",
                                                                marginLeft:
                                                                    "auto",
                                                                marginTop:
                                                                    "8px",
                                                                width: "50px",
                                                                height: "25px",
                                                            }}
                                                        >
                                                            <DisabledByDefaultIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    dialog.userId,
                                                                    dialog.timestamp
                                                                )
                                                            }
                                                            style={{
                                                                gridArea: "s3",
                                                                marginLeft:
                                                                    "auto",
                                                                marginTop:
                                                                    "32px",
                                                                width: "50px",
                                                                height: "25px",
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        <h3>
                                                            &lt;{" "}
                                                            {dialog.timestamp}{" "}
                                                            &gt;
                                                        </h3>
                                                    </div>
                                                    <div className="results">
                                                        <div className="results__item">
                                                            <div className="results__name">
                                                                ✔︎ 내 대화는?
                                                            </div>
                                                            <div className="results__list">
                                                                {dialog.score ==
                                                                    100 && (
                                                                        <>
                                                                            <p>
                                                                                원어민
                                                                                수준이에요!
                                                                            </p>
                                                                            <p>
                                                                                영어로
                                                                                대화가
                                                                                자연스러워요!
                                                                            </p>
                                                                            <div className="highlighted">
                                                                                <div className="text" style={{ color: "blue" }}>
                                                                                    <span>
                                                                                        Perfect!
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                {dialog.score >=
                                                                    80 &&
                                                                    dialog.score <
                                                                    100 && (
                                                                        <>
                                                                            <p>
                                                                                대화에
                                                                                무리
                                                                                없는
                                                                                수준이에요!
                                                                            </p>
                                                                            <p>
                                                                                상황에
                                                                                따라
                                                                                알맞은
                                                                                대화를
                                                                                할
                                                                                수
                                                                                있어요!
                                                                            </p>
                                                                            <div className="highlighted">
                                                                                <div className="text" style={{ color: "green" }}>
                                                                                    <span>
                                                                                        Good!
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                {dialog.score <
                                                                    80 && (
                                                                        <>
                                                                            <p>
                                                                                생존영어
                                                                                가능!
                                                                            </p>
                                                                            <p>
                                                                                말
                                                                                못해
                                                                                죽진
                                                                                않을
                                                                                거
                                                                                같아요!
                                                                            </p>
                                                                            <div className="highlighted">
                                                                                <div className="text" style={{ color: "orangered" }}>
                                                                                    <span>
                                                                                        You
                                                                                        can
                                                                                        survive!
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {dialog.messages.length !==
                                                        0 && (
                                                            <>
                                                                <div className="wrapChracterL">
                                                                    <div className="Character">
                                                                        <h4>
                                                                            My
                                                                            Character
                                                                        </h4>
                                                                        <center>
                                                                            <ScaleImg
                                                                                className="Character__box"
                                                                                src={`./assets/characters/single/${dialog.userTexture}.png`}
                                                                                alt={
                                                                                    dialog.userTexture
                                                                                }
                                                                            ></ScaleImg>
                                                                        </center>
                                                                        <div className="Nickname">
                                                                            <span className="Character__title">
                                                                                {
                                                                                    dialog.nickname
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="wrapChracterR">
                                                                    <div className="Character">
                                                                        <h4>NPC</h4>
                                                                        <center>
                                                                            <ScaleImg
                                                                                className="Character__box"
                                                                                src={`./assets/characters/single/${dialog.npc}.png`}
                                                                                alt={
                                                                                    "dialog.npc"
                                                                                }
                                                                            ></ScaleImg>
                                                                        </center>
                                                                        <div className="Nickname">
                                                                            <span className="Character__title">
                                                                                {
                                                                                    dialog.npc
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    {/* {messages.length===0 &&
                      (<>
                      <div className="Character" style={{gridColumn:'1/span 2', width:'50%', margin:'20px auto'}}>
                              <h4>My Character</h4>
                              <center>
                              <ScaleImg className="Character__box" src={imgUrl} alt={fix_playerTexture} ></ScaleImg>
                              </center>
                              <div className="Nickname"><span className="Character__title">Nickname: {playerNickname}</span></div>
                          </div>
                      </>)
                  } */}
                                                    <div className="corrections">
                                                        <span>✔︎ Corrections</span>

                                                        <Swiper
                                                            style={{ width: "102%", height: "90px", marginTop: "35px" }}
                                                            modules={[Pagination]}
                                                            pagination={{
                                                                clickable: true,
                                                                dynamicBullets: true,
                                                                renderBullet: function (index, className) {
                                                                    return `<span class="${className}"width: 10px; height: 10px; style="background-color: #ff0000;"></span>`
                                                                }
                                                            }}
                                                        >
                                                            <div className="corrections-list">
                                                                {dialog.corrections
                                                                    .length !== 0 &&
                                                                    dialog.corrections.map(
                                                                        (
                                                                            correction,
                                                                            index
                                                                        ) => (
                                                                            <SwiperSlide key={index} style={{ width: "102%", height: "66px", overflow: "auto" }}>
                                                                                {
                                                                                    <div
                                                                                        className="correction-div" style={{ marginLeft: "25px" }}
                                                                                    >
                                                                                        <p style={{ color: "crimson", fontWeight: "bold", marginTop: "0px", marginBottom: "4px" }}>
                                                                                            User
                                                                                            Sentence
                                                                                            :{" "}
                                                                                            {
                                                                                                correction.original
                                                                                            }
                                                                                        </p>
                                                                                        <p style={{ color: "forestgreen", fontWeight: "bold", marginTop: "0px", marginBottom: "4px" }}>
                                                                                            Corrected
                                                                                            Sentence:{" "}
                                                                                            :{" "}
                                                                                            {
                                                                                                correction.correction
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                }
                                                                            </SwiperSlide>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </Swiper>
                                                    </div>

                                                    <div className="talks">
                                                        {dialog.messages
                                                            .length !== 0 &&
                                                            dialog.messages.map(
                                                                (
                                                                    message,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        className={`msg ${message.side}-msg`}
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <div
                                                                            className="msg-img"
                                                                            style={{
                                                                                backgroundImage: `url(${`./assets/characters/single/${message.img}.png`})`,
                                                                            }}
                                                                        ></div>

                                                                        <div className="msg-bubble">
                                                                            <div className="msg-info">
                                                                                <div className="msg-info-name">
                                                                                    {
                                                                                        message.name
                                                                                    }
                                                                                </div>
                                                                            </div>

                                                                            <div className="msg-text">
                                                                                {
                                                                                    message.text
                                                                                }
                                                                            </div>
                                                                            {message.audioUrl && (
                                                                                currentAudio && currentAudio.src === message.audioUrl ?
                                                                                    <PauseIcon onClick={pauseAudio} /> :
                                                                                    <PlayArrowIcon onClick={() => playAudio(message.audioUrl)} />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        {dialog.messages
                                                            .length === 0 && (
                                                                <center>
                                                                    <p
                                                                        style={{
                                                                            textAlign:
                                                                                "center",
                                                                            marginTop:
                                                                                "50%",
                                                                            fontSize:
                                                                                "20px",
                                                                        }}
                                                                    >
                                                                        Try talk!
                                                                    </p>
                                                                </center>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ReportDiv>
                                }
                            </SwiperSlide>
                        ))}
                        <div className="swiper-button-next">
                            <CustomNavigationButton className="custom-next-button" direction="next" />
                        </div>
                        <div className="swiper-button-prev">
                            <CustomNavigationButton className="custom-prev-button" direction="prev" />
                        </div>
                    </Swiper>

                </SwiperDiv>
            )}
        </div>
    );
};

export default ReportBook;

const ScaleImg = styled.img`
    width: 50%;
    height: 50%;
    object-fit: cover;
`;
const Orange_p = styled.p`
    color: orange;
`;

const Green_p = styled.p`
    color: Green;
`;

const SwiperDiv = styled.div`
    .swiper-button-prev::after {
        content: none;
    }
    .swiper-button-next::after {
        content: none;
    }
    width: 100%;
    height:100%;
    display:flex;
`

const ReportDiv = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: table;
    font-family: "Gochi Hand", sans-serif;
  
  *{
    box-sizing: inherit;
  }

  .main-content {
    display:table-cell;
    vertical-align:middle;
    margin: 5em auto;
  }
  
  .notebook {
    max-width: 950px;
    min-width: 650px;
    min-height: 650px;
    margin: auto;
    border-radius: 16px;
    background: #cc4b48;
    padding: 2px 4px 2.5px;
  }
  .notebook__inner {
    width: 100%;
    height: 650px;
    position: relative;
    border-radius: 16px;
    background: linear-gradient(90deg, #fbfae8 15px, transparent 1%) center, linear-gradient(#fbfae8 15px, transparent 1%) center, #ccc;
    background-size: 16px 16px;
    display: grid;
    padding: 30px 20px 25px;
    // grid-template-areas: "title Character" "results Character" "results Character" "results Character" "notes Character";
    
    grid-template-columns: 25% 25% 25% 25%;
    grid-template-rows: 15% 20% 40% 25%;
    grid-template-areas: "title title title title" "results results talks talks" "Character Character talks talks" "notes notes talks talks";
  }
  .notebook__inner:after {
    content: "";
    width: 100px;
    height: 100%;
    top: 0;
    margin: auto;
    left: 0;
    right: 0;
    position: absolute;
    background: linear-gradient(to right, transparent 10%, rgba(153, 153, 153, 0.05) 50%, rgba(153, 153, 153, 0.4) 51%, rgba(153, 153, 153, 0.15) 51.5%, transparent 90%);
  }
  
  .title {
    grid-area: title;
    text-align: center;
    grid-column: 1 / span 4;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    grid-template-rows: 70% 30%;
    grid-template-areas:
        "s1 s2 s2 s3"
        "s4 s5 s5 s6";
  }
  .title h1 {
    font: 50px/1 "Poppins", cursive;
    // font: 50px/1 "Lobster", cursive;
    text-shadow: 2px 1px 0 #fbfae8, 3px 2px 0 coral;
    margin: 0;
    padding: 5px;
    background: rgba(186, 114, 123, 0.5);
    border-radius: 5px;
    grid-area: s1/s1/s2/s3;
  }
  .title h3 {
    font: 18px/1 "Poppins", cursive;
    font-weight: bold;
    margin: 6px;
    text-align: right;
    grid-area: s6;
  }
  
  .results {
    grid-area: results;
    // display: grid;
    // grid-template-columns: repeat(1, 1fr);
    // grid-gap: 15px;
    margin-right: 22px;
    height:100%;
    grid-column: 1/span 2;
  }
  .results__item {
    border: 2px solid #111;
    position: relative;
    height: 100%
  }
  .results__item2 {
    border: 2px solid #111;
    height: 160px;
    overflow:auto;
    position: relative;
  }
  .results__item:nth-child(1) {
    box-shadow: 3px 3px 0 0 rgba(208, 91, 88, 0.4);
  }
  .results__item2:nth-child(1) {
    box-shadow: 3px 3px 0 0 rgba(244, 68, 46, 0.5);
  }
  .results__name {
    padding: 5px 5px 2px;
    font: 16px/1 "Poppins", cursive;
    font-weight:900;
    border-bottom: 2px solid #111;
  }
  .results__list {
    font: 16px/1.5 "MICEGothic Bold", cursive;
    padding: 8px;
    line-height: 0.9;
  }
  .results p {
    padding-left: 8px;
    position: relative;
    margin: 5px 0;
  }
  .results p:after {
    content: "-";
    top: 0;
    position: absolute;
    left: 0;
  }
  .results .highlighted {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 8px;
    left: 0;
    text-align: center;
    font-size: 30px;
    color: blue;
    font-family: "Gochi Hand", sans-serif;
  }
  .results .highlighted .text {
    margin-top: 5px;
    position: relative;
  }
  .results .highlighted .text span {
    position: relative;
    z-index: 2;
  }
  .results .highlighted .text:after {
    content: "";
    background: rgba(239, 184, 186, 0.3);
    width: 95%;
    height: 100%;
    position: absolute;
    left: 2px;
    top: 0;
    z-index: 1;
    transform: rotate(-3deg);
  }
  
  .corrections {
    grid-area: notes;
    // border: 2px solid #111;
    border-width: 0 2px 2px;
    margin: 35px 20px 0 0;
    position: relative;
    font-family: Open Sans;
  }
  .corrections .swiper-pagination-bullet {
    display: inline-block;
    margin: 0 5px; /* 불렛 간의 간격 설정 */
  }
  .corrections span {
    display: block;
    margin: -12px 0px -33px 0px;
    font: 32px "Open Sans", cursive;
    // text-shadow: 2px 1px 0 #fbfae8, 5px 4px 0 coral;
  }
  // .corrections span:before {
  //   content: "";
  //   position: absolute;
  //   width: 100%;
  //   height: 2px;
  //   top: 0;
  //   left: 0;
  //   background: #111;
  //   background: linear-gradient(to right, #111 15px, transparent 15px, transparent 160px, #111 95px);
  // }
  .corrections-list {
    margin-top: 24px;
    padding: 10px;
    line-height: 2;
  }
  .wrapCharacterL{
    grid-area: Character;
    grid-column: 1;
    grid-row: 1/span 2;
  }
  .wrapCharacterR{
    grid-area: Character;
    grid-column: 2;
    grid-row: 1/span 2;
  }
  .Character {
    grid-area: Character;
    margin: 50px 20px 0px 20px;
    // display: grid;
    // grid-gap: 6px 10px;
    align-items: center;
    // grid-row: 1/span 2;
    // grid-template-columns: repeat(1, 1fr);
    // grid-template-rows: repeat(6, auto);
  }
  .Character h4 {
    text-align: center;
    margin: 0 0 10px;
    font: 16px/1 "Rock Salt", cursive;
  }
  .Character h4:first-of-type {
    // grid-column: 1/span 4;
  }
  .Character__box {
    // border: 4px groove gray;
    // grid-column: span 2;
    padding: 7px 7px 5px;
  }
  .Character__title {
    font: 15px "MaplestoryOTFLight", cursive;
  }
  .Character__amount {
    font: 19px "Gochi Hand", cursive;
    display: inline-block;
    margin-left: 10px;
  }
  .Character .Nickname {
    position: relative;
    // grid-column: 1/span 4;
    width: 99%;
    padding: 10px 10px 5px;
    background: rgba(239, 184, 186, 0.4);
    box-shadow: 3px 3px 0 0 rgba(231, 149, 152, 0.7);
    font: 16px/1 "Lexend Peta", cursive;
    text-align:center;
  }

  .talks {
    grid-area: talks;
    // display: grid;
    // grid-template-columns: repeat(1, 1fr);
    // grid-gap: 15px;
    border: 4px groove gray;
    margin-left: 22px;
    height:100%
    grid-column: 1/span 2;
    overflow: auto;
    font-family:Open Sans;
  }


  .msg {
    display: flex;
    align-items: flex-end;
    margin-bottom: 10px;
    background-color: rgba(
        255,
        255,
        255,
        0.5
    ); // Semi-transparent white background
    }

    .msg:last-of-type {
        margin: 0;
    }

    .msg-img {
        width: 50px;
        height: 50px;
        margin-right: 10px;
        background: #ddd;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        border-radius: 50%;
    }

    .msg-bubble {
        max-width: 330px;
        padding: 15px;
        border-radius: 15px;
        background: #ececec;
    }

    .msg-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .msg-info-name {
        margin-right: 10px;
        font-weight: bold;
    }

    .msg-info-time {
        font-size: 0.85em;
    }

    .left-msg .msg-bubble {
        border-bottom-left-radius: 0;
        // Semi-transparent white background
    }

    .right-msg {
        flex-direction: row-reverse;
        background-color: rgba(
            255,
            255,
            255,
            0
        ); // Semi-transparent white background
    }

    .left-msg {
        background-color: rgba(255, 255, 255, 0);
    }

    .right-msg .msg-bubble {
        background: 579ffb;
        // color: #fff;
        border-bottom-right-radius: 0;
    }

    .right-msg .msg-img {
        margin: 0 0 0 10px;
    }

    
`;


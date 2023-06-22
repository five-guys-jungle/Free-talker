import React, { useEffect,useState } from "react";
import store, { RootState, useAppDispatch } from "../stores";
import { openAirport } from "../stores/gameSlice";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.
import TalkBox from "./npcdialog/TalkBox";
import { TalkBoxState } from "../stores/talkBoxSlice";
import { correctionState, scoreState } from "../stores/reportSlice";

// interface NPCDialogProps {
//     initialDialog?: string;
//     onClose: () => void;
// }

const Report = (data:any) => {
    
    const {playerId, playerNickname, playerTexture} = useSelector((state: RootState) => {return {...state.user}});
    
    useEffect(() => {
        console.log(playerId)
        console.log(playerNickname)
        console.log(playerTexture)


    }, [playerId, playerNickname, playerTexture]);

    const corrections = useSelector(
      (state: { correction: correctionState }) => state.correction.corrections
    );

    
    const messages = useSelector(
        (state: { talkBox: TalkBoxState }) => state.talkBox.messages
    );

    let score = useSelector(
      (state: { score: scoreState }) => state.score.score
  )

    let fix_playerTexture=playerTexture;
    // let temp_str=fix_playerTexture.split("");
    // let lowerChar;
    // lowerChar=fix_playerTexture.charCodeAt(0)
    // temp_str[0]=String.fromCharCode(lowerChar-32);
    // fix_playerTexture=temp_str.join("");
    // console.log(fix_playerTexture)
    
    const imgUrl= "./assets/characters/single/"+fix_playerTexture+".png";
    console.log(imgUrl)
    const handleClose = () => {
        store.dispatch(openAirport());
    };

    const date = new Date();
    const month:{[key:number]:string}={
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
        12: "December"
    }

    return (
        <ReportDiv>
            <div className="main-content">
                <div className="notebook">
                    <div className="notebook__inner">
                        <div className="title">
                            <h1>REPORT</h1>
                            <h3>&lt; {month[date.getMonth() + 1]} {date.getDate()} &gt;</h3>
                        </div>
                        <div className="results">
                            <div className="results__item">
                                <div className="results__name">✔︎ 내 대화는?</div>
                                <div className="results__list">
                                    { score===100 && (<>
                                      <p>원어민 수준이에요!</p>
                                        <p>영어로 대화가 자연스러워요!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>Perfect!</span></div>
                                        </div></>)
                                    }
                                    { score>=80 && (<>
                                      <p>대화에 무리 없는 수준이에요!</p>
                                        <p>상황에 따라 알맞은 대화를 할 수 있어요!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>Good!</span></div>
                                        </div></>)
                                    }
                                    { score>=60 && (<>
                                      <p>생존영어 가능!</p>
                                        <p>말 못해 죽진 않을 거 같아요!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>You can survive!</span></div>
                                        </div></>)
                                    }
                                </div>
                            </div>
                        </div>
                        {messages.length!==0 &&
                            (<>
                            <div className="wrapChracterL">
                                <div className="Character">
                                    <h4>My Character</h4>
                                    <center>
                                    <ScaleImg className="Character__box" src={`./assets/characters/single/${playerTexture}.png`} alt={fix_playerTexture} ></ScaleImg>
                                    </center>
                                    <div className="Nickname"><span className="Character__title">Nickname: {playerNickname}</span></div>
                                </div>
                            </div>
                            <div className="wrapChracterR">
                                <div className="Character">
                                    <h4>NPC</h4>
                                    <center>
                                    <ScaleImg className="Character__box" src={`./assets/characters/single/${messages[1].img}.png`} alt={"Nancy"} ></ScaleImg>
                                    </center>
                                    <div className="Nickname"><span className="Character__title">NPCname: {messages[1].name}</span></div>
                                </div>
                            </div>
                            </>)
                        }
                        {messages.length===0 &&
                            (<>
                            <div className="Character" style={{gridColumn:'1/span 2', width:'50%', margin:'20px auto'}}>
                                    <h4>My Character</h4>
                                    <center>
                                    <ScaleImg className="Character__box" src={imgUrl} alt={fix_playerTexture} ></ScaleImg>
                                    </center>
                                    <div className="Nickname"><span className="Character__title">Nickname: {playerNickname}</span></div>
                                </div>
                            </>)
                        }
                        <div className="corrections"><span>Corrections</span>
                            <div className="corrections-list">
                                {corrections.length!==0 && 
                                corrections.map((correction, index) => (
                                  <div className="correction-div" key={index}>
                                    <p>User Sentence : {correction.original}</p>
                                    <p>Corrected Sentence: {correction.correction}</p>
                                  </div>
                                ))
                                }
                            </div>
                        </div>
                        <div className="talks">
                            {messages.length!==0 &&
                                messages.map((message, index) => (
                                    <div className={`msg ${message.side}-msg`} key={index}>
                                        <div
                                            className="msg-img"
                                            style={{
                                                backgroundImage: `url(${`./assets/characters/single/${message.img}.png`})`,
                                            }}
                                        ></div>

                                        <div className="msg-bubble">
                                            <div className="msg-info">
                                                <div className="msg-info-name">
                                                    {message.name}
                                                </div>
                                            </div>

                                            <div className="msg-text">{message.text}</div>
                                        </div>
                                    </div>
                                ))
                            }
                            {messages.length===0 &&
                                <center>
                                    <p style={{textAlign:'center', marginTop:'50%', fontSize:'20px'}}>Try talk!</p>
                                </center>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ReportDiv>
    );
};

export default Report;

const ScaleImg=styled.img`
width:50%;
height:50%;
object-fit: cover;
`
const Orange_p = styled.p`
color:orange`

const Green_p = styled.p`
color:Green`

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
  }
  .title h1 {
    font: 50px/1 "Lexend Peta", cursive;
    // font: 50px/1 "Lobster", cursive;
    text-shadow: 2px 1px 0 #fbfae8, 5px 4px 0 coral;
    margin: 0;
    padding: 5px;
    background: rgba(186, 114, 123, 0.5);
    border-radius: 5px;
  }
  .title h3 {
    font: 18px/1 "Lexend Peta", cursive;
    font-weight: bold;
    margin: 8px;
    text-align: right;
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
    font: 14px/1.5 "Gasoek One", cursive;
    border-bottom: 2px solid #111;
  }
  .results__list {
    padding: 8px;
    font-size: 14px/1.5;
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
  }
  .corrections span {
    display: block;
    margin: -25px 22px;
    font: 32px "Lexend Peta", cursive;
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
    font: 4px "Lexend Peta", cursive;
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

`
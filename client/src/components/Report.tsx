import React, { useEffect,useState } from "react";
import store, { RootState, useAppDispatch } from "../stores";
import { openAirport } from "../stores/gameSlice";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux"; // react-redux에서 useSelector를 불러옵니다.

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

    let fix_playerTexture=playerTexture;
    let temp_str=fix_playerTexture.split("");
    let lowerChar;
    lowerChar=fix_playerTexture.charCodeAt(0)
    temp_str[0]=String.fromCharCode(lowerChar-32);
    fix_playerTexture=temp_str.join("");
    console.log(fix_playerTexture)
    
    let imgUrl= "./assets/characters/single/"+fix_playerTexture+"_idle_anim_24.png"
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
    let score=60;
    return (
        <ReportDiv>
            <div className="main-content">
                <div className="notebook">
                    <div className="notebook__inner">
                        <div className="title">
                            <h1>FREE TALKER</h1>
                            <h3>&lt; Reporting &gt; {month[date.getMonth() + 1]} {date.getDate()}</h3>
                        </div>
                        <div className="results">
                            <div className="results__item">
                                <div className="results__name">✔︎ 내 발음은?</div>
                                <div className="results__list">
                                    { score==100 && (<>
                                      <p>원어민 수준이에요!</p>
                                        <p>영어로 대화하는게 자연스러워요!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>Perfect!</span></div>
                                        </div></>)
                                    }
                                    { score==80 && (<>
                                      <p>대화에 무리 없는 수준이에요!</p>
                                        <p>상황에 따라 알맞은 대화가 가능합니다!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>Good!</span></div>
                                        </div></>)
                                    }
                                    { score==60 && (<>
                                      <p>생존영어 가능!</p>
                                        <p>말 못해 죽진 않을 거 같아요!</p>
                                        <div className="highlighted">
                                        <div className="text"> <span>You can survive!</span></div>
                                        </div></>)
                                    }
                                </div>
                            </div>
                            <div className="results__item2">
                                <div className="results__name">✔︎ 문법 교정</div>
                                <div className="results__list">
                                    <p>나는 어떻게 말했을까?</p>
                                    <Orange_p>I want go SWJUNGLE</Orange_p>
                                </div>
                                <div className="results__list">
                                    <p>이렇게 말해보면 어떨까요?</p>
                                    <Green_p>I want to go SWJUNGLE</Green_p>
                                    <Green_p>I'd like to go SWJUNGLE</Green_p>
                                </div>
                                <div className="results__list">
                                    <p>나는 어떻게 말했을까?</p>
                                    <Orange_p>I want go SWJUNGLE</Orange_p>
                                </div>
                                <div className="results__list">
                                    <p>이렇게 말해보면 어떨까요?</p>
                                    <Green_p>I want to go SWJUNGLE</Green_p>
                                    <Green_p>I'd like to go SWJUNGLE</Green_p>
                                </div>
                            </div>
                        </div>
                        <div className="notes"><span>Life Quotes</span>
                            <div className="notes__list">
                                - Believe in yourself.
                                <br />
                                - Follow your heart.
                            </div>
                        </div>
                        <div className="Character">
                            <h4>My Character</h4>
                            <center>
                            <ScaleImg className="Character__box" src={imgUrl} alt={fix_playerTexture} ></ScaleImg>
                            </center>
                            <div className="Nickname"><span className="Character__title">Nickname: {playerNickname}</span></div>
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
    max-width: 800px;
    min-width: 550px;
    min-height: 570px;
    margin: auto;
    border-radius: 16px;
    background: #cc4b48;
    padding: 2px 4px 2.5px;
  }
  .notebook__inner {
    width: 100%;
    height: 570px;
    position: relative;
    border-radius: 16px;
    background: linear-gradient(90deg, #fbfae8 15px, transparent 1%) center, linear-gradient(#fbfae8 15px, transparent 1%) center, #ccc;
    background-size: 16px 16px;
    display: grid;
    padding: 30px 20px 25px;
    grid-template-areas: "title Character" "results Character" "results Character" "results Character" "notes Character";
    grid-template-columns: 50% 50%;
    grid-template-rows: 18% auto auto 30% 25%;
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
  }
  .title h1 {
    font: 50px/1 "Lobster", cursive;
    text-shadow: 2px 1px 0 #fbfae8, 5px 4px 0 coral;
    margin: 0;
  }
  .title h3 {
    font: 13px/1.2 "Rock Salt", cursive;
    margin: 8px;
  }
  
  .results {
    grid-area: results;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 15px;
    margin-right: 22px;
    height:100%
  }
  .results__item {
    border: 2px solid #111;
    position: relative;
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
    font-size: 14px;
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
    font-size: 20px;
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
  
  .notes {
    grid-area: notes;
    border: 2px solid #111;
    border-width: 0 2px 2px;
    margin: 35px 20px 0 0;
    position: relative;
  }
  .notes span {
    display: block;
    margin: -25px 22px;
    font: 32px "Lobster", cursive;
    text-shadow: 2px 1px 0 #fbfae8, 5px 4px 0 coral;
  }
  .notes span:before {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    top: 0;
    left: 0;
    background: #111;
    background: linear-gradient(to right, #111 15px, transparent 15px, transparent 95px, #111 95px);
  }
  .notes__list {
    margin-top: 24px;
    padding: 10px;
    line-height: 1.2;
  }
  
  .Character {
    grid-area: Character;
    margin: 0 0 20px 20px;
    display: grid;
    grid-gap: 6px 10px;
    align-items: center;
    grid-template-columns: repeat(1, 1fr);
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
    font: 4px;
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
    font: 16px/1 "Rock Salt", cursive;
  }

  `
import React, { useState, useEffect, useRef } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from "react-redux";
import { TalkBoxState } from "../../stores/talkBoxSlice";
import store, { RootState, useAppDispatch } from "../../stores";
import io, { Socket } from "socket.io-client"
import {clearcharacters} from "../../stores/userboxslice"

const blankchar = '../assets/characters/blankchar2.png';
const Image = styled('img')`
  width: 180px;
  height: auto;
`;

const UserBoxContainer = styled(Box)`
  text-align: center;
  margin-bottom: 100px;
`;

const AvatarContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 200px;
  flex: 1;

  &:last-child {
    margin-right: 0;
  }
`;

const UserBoxWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;

`;


const UserBox: React.FC = () => {
  const { playerId, playerNickname, playerTexture } = useSelector((state: RootState) => {return {...state.user}});
  // const { playerId, playerNickname, playerTexture } = useSelector((state: RootState) => state.user);
  const socket = useRef<Socket | null>(null);
  const {otherNickname, otherTexture} = useSelector((state: RootState) => {return {...state.userbox}});
  const dispatch = useAppDispatch();
	const socketNamespace = useSelector(
		(state: { rtc: { socketNamespace: string } }) => state.rtc.socketNamespace
	);

  // useEffect(() => {
  //     console.log(playerId)
  //     console.log(playerNickname)
  //     console.log(playerTexture)
  //   return () => {
  //     dispatch(clearcharacters());
  //   }
  // }, [playerId, playerNickname, playerTexture]);

  
  useEffect(() => {
    console.log(playerId)
    console.log(playerNickname)
    console.log(playerTexture)
    return () => {
      dispatch(clearcharacters());
    }
}, [playerId, playerNickname, playerTexture]);

  
  
  // const messages = useSelector(
  //     (state: { talkBox: TalkBoxState }) => state.talkBox.messages
  // );


  // const messages = useSelector(
  //     (state: { talkBox: TalkBoxState }) => state.talkBox.messages
  // );

  let fix_playerTexture=playerTexture;

  // useEffect(() => {
  //   console.log("char~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
  //   return () => {
  //     dispatch(clearcharacters());
  //   }
  // }, [otherNickname, otherTexture]);

  useEffect(() => {
    console.log("char~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    // return () => {
    //   dispatch(clearcharacters());
    // }
  }, [otherNickname, otherTexture]);

  const renderUserAvatar = () => {
    if (otherTexture) {
      return <Image src={`../assets/characters/single/${otherTexture}.png`} alt="User Avatar" />;
    } else {
      return <Image src={blankchar} alt="Blank Avatar" />;
    }
  };

  const renderOtherNickname = () => {
    if (otherNickname) {
      return <Typography variant="h4" align="center" fontFamily={"MaplestoryOTFLight"}>{otherNickname}</Typography>
    } else {
      return <Typography variant="h5" align="center" fontFamily={"MaplestoryOTFLight"}>대화 상대를 <div></div> 기다려 주세요</Typography>
    }
  };

  return (
    <UserBoxWrapper>
      <UserBoxContainer>
        <Typography variant="h3" style={{ fontFamily: "MaplestoryOTFLight", fontWeight: "bold" }}>화상을 통해 <div></div> 자유롭게 대화를 나누어 보세요</Typography>
      </UserBoxContainer>

      <Box display="flex" flexDirection="row" >
        <AvatarContainer>
          <Image src={`../assets/characters/single/${playerTexture}.png`} alt={fix_playerTexture} />
          <Typography variant="h4" align="center" fontFamily={"MaplestoryOTFLight"}>{playerNickname}</Typography>
        </AvatarContainer>
        <AvatarContainer>
          {/* <Image src={`../assets/characters/single/${otherTexture}.png`} alt="User Avatar" /> */}
          {/* <Typography variant="body1" align="center">{otherNickname}</Typography> */}
          {renderUserAvatar()}
          {renderOtherNickname()}
        </AvatarContainer>
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          position: 'absolute',
          bottom: 10, 
          left: 10, 
          color: '#000',
          padding: '5px',
          borderRadius: '5px'
        }}
        fontFamily={"MaplestoryOTFLight"}
      >
        EXIT : <span style={{ color: "#C70039" }}>(E)</span><div></div>통화 중 E키를 누르면 맵으로 돌아갑니다.
      </Typography>
    </UserBoxWrapper>
  );
};

export default UserBox;

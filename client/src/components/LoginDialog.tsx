import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import styled from "styled-components";

import { useSetRecoilState, useRecoilState, useRecoilValue } from "recoil";
import { Snackbar, SnackbarOrigin } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MySnackbar from "./MySnackBar";
import { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Frame from "../assets/images/frame.png";
import "swiper/css";
import "swiper/css/navigation";
// import loginFrame from '../assets/images/frame.png';
import chars from "../assets/characters";
import {
    playerIdState,
    playerTextureState,
    playerNicknameState,
} from "../recoil/user/atoms";
import SignUpDialog from "./SignUpDialog";

const DB_URL = process.env.REACT_APP_DB_URL || "http://localhost:3003";

interface Characters {
    [key: string]: string;
}

export interface State extends SnackbarOrigin {
    openLoginWarn: boolean;
}

const characters = chars as Characters;

const avatars: { name: string; img: string }[] = Array.from(
    new Array(4),
    (d, idx) => ({ name: `char${idx}`, img: characters[`char${idx}`] })
);

function LoginDialog() {
    const [openLoginWarn, setOpenLoginWarn] = React.useState(false);
    const [loginFailMsg, setLoginFailMsg] = React.useState("");

    const handleClick = () => {
        setOpenLoginWarn(true);
    };
    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenLoginWarn(false);
    };

    const [userId, setUserId] = useState<string>("");
    const [userIdFieldEmpty, setUserIdFieldEmpty] = useState<boolean>(false);
    const [userPw, setUserPw] = useState<string>("");
    const [userPwFieldEmpty, setUserPwFieldEmpty] = useState<boolean>(false);
    const [avatarIndex, setAvatarIndex] = useState<number>(0);

    const setPlayerId = useSetRecoilState(playerIdState);
    const setPlayerNickname = useSetRecoilState(playerNicknameState);
    const setPlayerTexture = useSetRecoilState(playerTextureState);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (userId === "") {
            setUserIdFieldEmpty(true);
            return;
        } else if (userPw === "") {
            setUserPwFieldEmpty(true);
            return;
        } else {
            const body = { userId: userId, userPw: userPw };

            try {
                const response = await axios.post(`${DB_URL}/user/login`, body);

                if (response.data.statue === 200) {
                    const { payload } = response.data;

                    const userId = payload.userId;
                    const userNickname = payload.userNickname;
                    const userAvatar = avatars[avatarIndex].name;

                    setPlayerId(userId);
                    setPlayerNickname(userNickname);
                    setPlayerTexture(userAvatar);

                    // handleScene(GAME_STATUS.LOBBY, {
                    //   playerId: payload.userNickname,
                    //   playerTexture: avatars[avatarIndex].name,
                    // });

                    // in this part, we need to save the token to the local storage
                    // and then redirect to the main page
                    // and then we need to get the user info from the server
                    // and save it to the recoil state
                }
            } catch (e) {
                if (e instanceof AxiosError && e.response?.status === 420) {
                    setLoginFailMsg("이미 접속중인 유저입니다.");
                } else {
                    setLoginFailMsg(
                        "아이디 혹은 비밀번호가 일치하지 않습니다."
                    );
                }
                handleClick();
                setUserId("");
                setUserPw("");
            }
        }
    };

    return (
        <Wrapper
            style={{
                position: "absolute",
                backgroundImage: `url(${Frame})`,
                backgroundSize: "100% 100%",
            }}
        >
            <MySnackbar
                text={loginFailMsg}
                state="warning"
                onClose={handleClose}
                onOpen={openLoginWarn}
            />
            <Content onSubmit={handleSubmit} id="login">
                <Left>
                    <Swiper
                        modules={[Navigation]}
                        navigation
                        spaceBetween={0}
                        slidesPerView={1}
                        onSlideChange={(swiper) => {
                            setAvatarIndex(swiper.activeIndex);
                        }}
                    >
                        {avatars.map((avatar) => (
                            <SwiperSlide key={avatar.name}>
                                <img src={avatar.img} alt={avatar.name} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Left>
                <Right>
                    <div style={{ height: "20px" }}></div>
                    <TextField
                        fullWidth
                        label="아이디"
                        variant="outlined"
                        error={userIdFieldEmpty}
                        helperText={
                            userIdFieldEmpty ? "아이디를 입력해주세요." : ""
                        }
                        value={userId}
                        onInput={(e) => {
                            setUserId((e.target as HTMLInputElement).value);
                        }}
                    />
                    <div style={{ height: "20px" }}></div>
                    <TextField
                        fullWidth
                        type="password"
                        label="비밀번호"
                        variant="outlined"
                        value={userPw}
                        margin="normal"
                        error={userPwFieldEmpty}
                        helperText={
                            userPwFieldEmpty ? "비밀번호를 입력해주세요." : ""
                        }
                        onInput={(e) => {
                            setUserPw((e.target as HTMLInputElement).value);
                        }}
                    />
                    <div style={{ height: "20px" }}></div>
                    <Bottom>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            size="large"
                            form="login"
                            sx={{ marginBottom: "10px" }}
                        >
                            시작하기
                        </Button>
                        <SignUpDialog />
                    </Bottom>
                </Right>
            </Content>
        </Wrapper>
    );
}

export default LoginDialog;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0);
    border-radius: 16px;
    padding: 36px 60px;
    // box-shadow: 0px 0px 5px #0000006f;
    img {
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -o-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
    }
`;

const Content = styled.form`
    display: flex;
    margin: 36px 0;
`;

const Left = styled.div`
    margin-right: 48px;
    margin-top: -8px;

    --swiper-navigation-size: 24px;

    .swiper {
        width: 160px;
        height: 200px;
        border-radius: 8px;
        overflow: hidden;
    }

    .swiper-slide {
        width: 160px;
        height: 215px;
        // background: ${({ theme }) => theme.lighterBlue};
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .swiper-slide img {
        display: block;
        width: 97px;
        height: 136px;
        object-fit: contain;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
`;

const Right = styled.div`
    width: 300px;
    display: block;
    align-items: center;
    // padding-top: 50px;
`;

const Bottom = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    margin-top: 20px;
`;

const Warning = styled.div`
    margin-top: 30px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleIsClicked } from '../stores/guiderSlice';

const Guider = () => {
    const dispatch = useDispatch();
    const isClicked = useSelector((state: { guider: { isClicked: boolean } }) => state.guider.isClicked);

    const handleClick = () => {
        dispatch(toggleIsClicked());
    };

    return (
        <StyledDiv isClicked={isClicked} onClick={handleClick}>
            {isClicked ? (
                <DescriptionContainer>
                    <ImageDescription src="./assets/UI/Keyboard_D.png" alt="D keyboard" preText="1. 먼저, 말을하려면 " nextText="키를 눌러 마이크의 상태가 녹음중으로 변하는지 확인하세요." />
                    <ImageDescription src="./assets/UI/Keyboard_D.png" alt="D keyboard" preText="2. 마이크의 상태가 녹음중으로 변경되면 말을 시작하고, 그만 말하고 싶을때 " nextText="키를 눌러 녹음을 중단하세요." />
                    <ImageDescription src="./assets/UI/Keyboard_S.png" alt="S keyboard" preText="3. 재생되는 NPC의 음성을 그만 듣고 싶으면 " nextText="키를 눌러 NPC음성을 스킵하세요." />
                    <ImageDescription src="./assets/UI/Keyboard_E.png" alt="E keyboard" preText="3. 대화를 그만하고 싶을때 " nextText="키를 대화를 종료하고 Report를 받아보세요. " />
                    <ImageDescription2 src1="./assets/UI/Keyboard_E.png" alt1="E keyboard"
                        src2="./assets/UI/Keyboard_D.png" alt2="D keyboard" preText="* NPC의 음성이 재생이 스킵되거나 재생 완료 되기전까지는 " middleText=', ' nextText="키들이 비활성화 됩니다. " />
                </DescriptionContainer>
            ) : (
                <p>대화방법 안내</p>
            )}
        </StyledDiv>
    );
};

export default Guider;

interface ImageDescriptionProps {
    src: string;
    alt: string;
    preText: string;
    nextText: string;
}
interface ImageDescriptionProps2 {
    src1: string;
    src2: string;
    alt1: string;
    alt2: string;
    preText: string;
    middleText: string;
    nextText: string;
}
const ImageDescription: React.FC<ImageDescriptionProps> = ({ src, alt, preText, nextText }) => (
    <ItemContainer>
        <Description>
            <span>{preText}</span>
            <Image src={src} alt={alt} />
            <span>{nextText}</span>
        </Description>
    </ItemContainer>
);
const ImageDescription2: React.FC<ImageDescriptionProps2> = ({ src1, src2, alt1, alt2, preText, middleText, nextText }) => (
    <ItemContainer>
        <Description>
            <span>{preText}</span>
            <Image src={src1} alt={alt1} />
            <span>{middleText}</span>
            <Image src={src2} alt={alt2} />
            <span>{nextText}</span>
        </Description>
    </ItemContainer>
);
interface StyledDivProps {
    isClicked: boolean;
}

const StyledDiv = styled.div<StyledDivProps>`
    position: fixed;
    transform: translate(-50%, -50%);
    padding: 10px; // add padding to match the text size
    border-radius: 20px; // add border radius to make corners rounded
    background-color: lightskyblue;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
    cursor: pointer;

    ${props => props.isClicked ? css`
        top: 50%;
        left: 50%;
        width: auto;
        height: auto;
        padding: 20px; // Add padding
    ` : css`
        right: 5%;
        bottom: -2%;
        padding: 10px; // add padding to match the text size
    `}
`;

const DescriptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start; // From center to flex-start
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
    padding-left: 10px; // Add some padding if you need
`;

const ItemContainer = styled.div`
    display: flex;
    justify-content: flex-start; // From center to flex-start
    gap: 10px;
    width: auto; // Ensure the container size is based on its content
`;

const Image = styled.img`
    width: 40px;
    height: 40px;
    display: inline-block;
`;

const Description = styled.p`
    margin: 0;
    white-space: nowrap;
`;

import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { toggleIsClicked } from '../stores/guiderSlice';
import { useSelector, useDispatch } from 'react-redux';

const Guider = React.memo(() => {
    const modalRef = useRef<HTMLDivElement>(null);

    const dispatch = useDispatch();
    const isClicked = useSelector((state: { guider: { isClicked: boolean } }) => state.guider.isClicked);


    const handleClick = () => {
        dispatch(toggleIsClicked());
    };
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 모달 클릭 시 버블링 방지
    };


    const handleOutsideClick = (e: MouseEvent) => {
        if (isClicked && modalRef.current && !modalRef.current.contains(e.target as Node)) {
            dispatch(toggleIsClicked());
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);


    return (
        <>
            <StyledButton isClicked={isClicked} onClick={handleClick}>대화방법 안내</StyledButton>
            {isClicked && (
                <DescriptionModal>
                    <CloseButton onClick={handleClick}>X</CloseButton>
                    <DescriptionContainer ref={modalRef} onClick={handleModalClick}>
                        <ImageDescription
                            src="./assets/UI/Keyboard_E.png"
                            alt="E keyboard"
                            preText="1. 먼저, NPC 근처로 가 "
                            nextText="키를 눌러 대화를 시작해보세요."
                        />
                        <ImageDescription
                            src="./assets/UI/Keyboard_D.png"
                            alt="D keyboard"
                            preText="2. 말을하려면 "
                            nextText="키를 눌러 마이크의 상태가 녹음중으로 변하는지 확인하세요."
                        />
                        <ImageDescription
                            src="./assets/UI/Keyboard_D.png"
                            alt="D keyboard"
                            preText="3. 마이크의 상태가 녹음중으로 변경되면 말을 시작하고, 그만 말하고 싶을때 "
                            nextText="키를 눌러 녹음을 중단하세요."
                        />
                        <ImageDescription
                            src="./assets/UI/Keyboard_S.png"
                            alt="S keyboard"
                            preText="4. 재생되는 NPC의 음성을 그만 듣고 싶으면 "
                            nextText="키를 눌러 NPC음성을 스킵하세요."
                        />
                        <ImageDescription
                            src="./assets/UI/Keyboard_E.png"
                            alt="E keyboard"
                            preText="5. 대화를 그만하고 싶을때 "
                            nextText="키를 대화를 종료하고 Report를 받아보세요. "
                        />
                        <ImageDescription2
                            src1="./assets/UI/Keyboard_E.png"
                            alt1="E keyboard"
                            src2="./assets/UI/Keyboard_D.png"
                            alt2="D keyboard"
                            preText="* NPC의 음성이 재생이 스킵되거나 재생 완료 되기전까지는 "
                            middleText=", "
                            nextText="키들이 비활성화 됩니다. "
                        />
                    </DescriptionContainer>
                </DescriptionModal>
            )}
        </>
    );
});
interface StyledButtonProps {
    isClicked: boolean;
}
const StyledButton = styled.button<StyledButtonProps>`
  padding: 10px;
  border-radius: 20px;
  background-color: ${props => (props.isClicked ? 'lightskyblue' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  cursor: pointer;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: bold;
  ${props => !props.isClicked && css`
    background-color: lightskyblue;
    color: white;
  `}
`;

const DescriptionModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border-radius: 20px;
  background-color: lightskyblue;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  /* Add other styles if necessary */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 3px;
  padding: 10px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

// 이미지와 설명을 함께 표시하는 컴포넌트
interface ImageDescriptionProps {
    src: string;
    alt: string;
    preText: string;
    nextText: string;
}

const ImageDescription: React.FC<ImageDescriptionProps> = ({
    src,
    alt,
    preText,
    nextText,
}) => (
    <ItemContainer>
        <Description>
            <span>{preText}</span>
            <Image src={src} alt={alt} />
            <span>{nextText}</span>
        </Description>
    </ItemContainer>
);

// 이미지와 설명을 함께 표시하는 컴포넌트 (2개의 이미지)
interface ImageDescriptionProps2 {
    src1: string;
    src2: string;
    alt1: string;
    alt2: string;
    preText: string;
    middleText: string;
    nextText: string;
}

const ImageDescription2: React.FC<ImageDescriptionProps2> = ({
    src1,
    src2,
    alt1,
    alt2,
    preText,
    middleText,
    nextText,
}) => (
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

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 20px;
`;

const ItemContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
`;

const Image = styled.img`
  width: 40px;
  height: 40px;
`;


const Description = styled.p`
    margin: 0;
    white-space: nowrap;
`;

export default Guider;
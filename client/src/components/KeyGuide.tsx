import { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { toggleIsClicked } from '../stores/keyGuiderSlice';


const KeyGuider = () => {
  const dispatch = useDispatch();
  const isClicked = useSelector((state: { keyGuider: { isClicked: boolean } }) => state.keyGuider.isClicked);
  const modalRef = useRef<HTMLDivElement>(null);

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
      <StyledButton isClicked={isClicked} onClick={handleClick}>
        도움말
      </StyledButton>

      {isClicked && (
        <Modal onClick={handleClick}>
          <ModalContent onClick={handleModalClick}>
            <CloseButton onClick={handleClick}>X</CloseButton>
            <DescriptionContainer>
              <ImageDescription src="./assets/UI/Keyboard_Up.png" alt="Up keyboard" description="위쪽 이동" />
              <ImageDescription src="./assets/UI/Keyboard_Down.png" alt="Down keyboard" description="아래쪽 이동" />
              <ImageDescription src="./assets/UI/Keyboard_Left.png" alt="Left keyboard" description="왼쪽 이동" />
              <ImageDescription src="./assets/UI/Keyboard_Right.png" alt="Right keyboard" description="오른쪽 이동" />
              <ImageDescription src="./assets/UI/Keyboard_E.png" alt="E keyboard" description="상호작용" />
            </DescriptionContainer>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default KeyGuider;

interface ImageDescriptionProps {
  src: string;
  alt: string;
  description: string;
}

const ImageDescription: React.FC<ImageDescriptionProps> = ({ src, alt, description }) => (
  <ItemContainer>
    <Image src={src} alt={alt} />
    <Description>{description}</Description>
  </ItemContainer>
);

interface StyledButtonProps {
  isClicked: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  padding: 10px;
  border-radius: 20px;
  background-color: ${props => (props.isClicked ? 'rgb(28, 84, 178)' : 'transparent')};
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
    background-color: rgb(41, 121, 255);
    color: white;
  `}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
//   background-color: rgba(0, 0, 0, 0);
  z-index: 1000;  // 높은 z-index
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  position: relative;
  background-color: lightskyblue;
  padding: 20px;
  border-radius: 20px;
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background-color: lightskyblue;
    z-index: -1;
    border-radius: inherit;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0; /* Adjusted */
  right: 0; /* Adjusted */
  padding: 0px;
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

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 20px;
`;

const ItemContainer = styled.div`
  display: flex;
  justify-content: flex-start; // From center to flex-start
  gap: 10px;
  width: 100%; // Ensure the container takes up the full width
`;


const Image = styled.img`
    width: 40px;
    height: 40px;
`;

const Description = styled.p`
    margin: 0;
`;


// const StyledDiv = styled.div<StyledDivProps>`
//     padding: 10px;
//     border-radius: 20px;
//     background-color: lightskyblue;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     transition: all 0.5s ease;
//     cursor: pointer;
//     flex-shrink: 0;

//     ${props => props.isClicked && css`
//       border-radius: 20px;
//       width: auto;
//       height: auto;
//       max-width: 300px;
//       max-height: 400px;
//       padding: 20px;
//     `}
// `;
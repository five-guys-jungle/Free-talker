import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const Keyguider = () => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    };

    return (
        <StyledDiv isClicked={isClicked} onClick={handleClick}>
            {isClicked ? (
                <DescriptionContainer>
                    <ImageDescription src="./assets/UI/Keyboard_Up.png" alt="Up keyboard" description="위쪽 이동" />
                    <ImageDescription src="./assets/UI/Keyboard_Down.png" alt="Down keyboard" description="아래쪽 이동" />
                    <ImageDescription src="./assets/UI/Keyboard_Left.png" alt="Left keyboard" description="왼쪽 이동" />
                    <ImageDescription src="./assets/UI/Keyboard_Right.png" alt="Right keyboard" description="오른쪽 이동" />
                    <ImageDescription src="./assets/UI/Keyboard_E.png" alt="E keyboard" description="상호작용" />
                </DescriptionContainer>
            ) : (
                <p>도움말</p>
            )}
        </StyledDiv>
    );
};

export default Keyguider;

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

interface StyledDivProps {
    isClicked: boolean;
}

const StyledDiv = styled.div<StyledDivProps>`
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 10px; // add padding to match the text size
    border-radius: 20px; // add border radius to make corners rounded
    background-color: lightskyblue;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
    cursor: pointer;
  
    ${props => props.isClicked && css`
      border-radius: 20px;
      width: auto;
      height: auto;
      max-width: 300px; // set maximum width
      max-height: 400px; // set maximum height
      padding: 20px; // Add padding
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
    width: 100%; // Ensure the container takes up the full width
`;

const Image = styled.img`
    width: 40px;
    height: 40px;
`;

const Description = styled.p`
    margin: 0;
`;

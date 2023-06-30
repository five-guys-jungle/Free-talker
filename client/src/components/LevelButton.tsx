import React from 'react';
import styled, { css } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores'; // Assuming you have a RootState type defined
import { changeLevel } from '../stores/levelSlice';

const LevelButton = () => {
  const dispatch = useDispatch();
  const level = useSelector((state: RootState) => state.level.level);

  const handleClick = () => {
    dispatch(changeLevel());
    // Create a new custom event
    // const event = new CustomEvent('levelChanged', { detail: level });
    // // Dispatch the event
    // window.dispatchEvent(event);
  };
  return (
    <StyledDiv onClick={handleClick}>
      <p>{level}</p>
    </StyledDiv>
  );
};

export default LevelButton;

const StyledDiv = styled.div`
  padding: 10px;
  border-radius: 20px;
  background-color: lightskyblue;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: white;

  &:hover {
    background-color: deepskyblue;
  }
`;

// const StyledDiv = styled.div`
//   // position: relative; /* Use relative instead of fixed */
//   /* Remove right and bottom */
//   padding: 10px;
//   border-radius: 20px;
//   background-color: lightskyblue;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: all 0.5s ease;
//   cursor: pointer;
//   font-size: 16px;
//   font-weight: bold;
//   color: white;
//   flex-shrink: 0;

//   &:hover {
//     background-color: deepskyblue;
//   }
// `;
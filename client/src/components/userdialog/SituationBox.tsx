import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { UserDialogState, Situation, setSituation, clearSituation } from "../../stores/userDialogSlice";

const SituationBox: React.FC = () => {

  const ref = React.useRef<HTMLDivElement>(null);
  const situation = useSelector(
        (state: { userDialog: UserDialogState }) =>
            state.userDialog.situation
    );
  
  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
  }, []);


  return (
    
    <Box sx={{ width: '70%', height: '70%', pb: 20 }}>
      <Title>상황 추천</Title>
      <Box sx={{ overflow: 'auto', height: '100%',backgroundColor: '#e3f2fd' }} ref={ref}>
        <h2 className="Situation">{situation}</h2>
        {/* <List>
          {messages.map(({ primary, secondary }, index) => (
            <ListItem key={index}>
              <ListItemText primary={primary} secondary={secondary} />
            </ListItem>
          ))}
        </List> */}
      </Box>
    </Box>
  );
};

export default SituationBox;

interface SituationExample {
  primary: string;
  secondary: string;
}

const messageExamples: SituationExample[] = [
  {
    primary: 'What do you recommend from the menu?',
    secondary: '어떤 메뉴를 추천해주시겠어요?',
  },
  {
    primary: 'May I order a [beverage or food item], please?',
    secondary: '[음료나 식품] 주문해도 될까요?',
  },
  {
    primary: '111111111111111111111111',
    secondary: '11111111111111111111111111111111',
  },
  {
    primary: '222222222222222222222222222',
    secondary: '22222222222222222222222',
  },
  {
    primary: '333333333333333333333333333',
    secondary: '333333333333333333',
  },
  {
    primary: '444444444444444444444444444444444444444',
    secondary: '4444444444444444444444444444444444',
  },
  {
    primary: '55555555555555555555555555555555',
    secondary: '5555555555555555555555555555555',
  },
];

// 랜덤으로 스크립트 추천
function refreshMessages(): SituationExample[] {
  const shuffledExamples = [...messageExamples].sort(() => 0.5 - Math.random());
  return shuffledExamples.slice(0, 3);
}


const Title = styled.h2`
  text-align: center;
  margin-top: 5%;
  font-size: 2rem; // 기본 글자 크기
  @media (max-width: 768px) {
    font-size: 1rem; // 창 너비가 768px 이하일 때 글자 크기 조정
  }
  @media (max-width: 480px) {
    font-size: 0.5rem; // 창 너비가 480px 이하일 때 글자 크기 조정
  }
`;
;
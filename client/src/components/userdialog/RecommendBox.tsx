import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import styled from "styled-components";

const RecommendBox: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState(() => refreshMessages());

  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
    setMessages(refreshMessages());
  }, [value, setMessages]);

  return (
    
    <Box sx={{ width: 600, height: 220,  pb: 20 }}>
      <Title>Free talker recommend the expression in Cafe</Title>
      <Box sx={{ overflow: 'auto', height: '100%',backgroundColor: '#e3f2fd' }} ref={ref}>
        <List>
          {messages.map(({ primary, secondary }, index) => (
            <ListItem key={index}>
              <ListItemText primary={primary} secondary={secondary} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default RecommendBox;

interface RecommendedExample {
  primary: string;
  secondary: string;
}

const messageExamples: RecommendedExample[] = [
  {
    primary: 'What do you recommend from the menu?',
    secondary: '어떤 메뉴를 추천해주시겠어요?',
  },
  {
    primary: 'May I order a [beverage or food item], please?',
    secondary: '[음료나 식품] 주문해도 될까요?',
  },
  {
    primary: 'What do you recommend from the menu?',
    secondary: '어떤 메뉴를 추천해주시겠어요?',
  },
  {
    primary: 'May I order a [beverage or food item], please?',
    secondary: '[음료나 식품] 주문해도 될까요?',
  },
  {
    primary: 'What do you recommend from the menu?',
    secondary: '어떤 메뉴를 추천해주시겠어요?',
  },
  {
    primary: 'May I order a [beverage or food item], please?',
    secondary: '[음료나 식품] 주문해도 될까요?',
  },
  {
    primary: 'What do you recommend from the menu?',
    secondary: '어떤 메뉴를 추천해주시겠어요?',
  },
  {
    primary: 'May I order a [beverage or food item], please?',
    secondary: '[음료나 식품] 주문해도 될까요?',
  },
];

function refreshMessages(): RecommendedExample[] {
  return messageExamples;
}

const Title = styled.h2`
  text-align: center;
  margin-top: 30px;
`;
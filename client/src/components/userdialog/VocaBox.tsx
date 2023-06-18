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

const VocaBox: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState(() => refreshMessages());

  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
    setMessages(refreshMessages());
  }, [value, setMessages]);

  return (
    <Box sx={{ width: 500, height: 300, pb: 20 }}>
      <Title>Today’s voca and idium</Title>
      <Box sx={{ overflow: 'auto', height: '100%', backgroundColor: '#e3f2fd' }} ref={ref}>
        <List>
          {messages.map(({ primary, secondary }, index) => (
            <ListItem key={index}>
              <ListItemText primary={primary} secondary={secondary.split('\n').map((text, i) => (
                <React.Fragment key={i}>
                  {text}
                  <br />
                </React.Fragment>
              ))} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default VocaBox;

interface RecommendedExample {
  primary: string;
  secondary: string;
}

const messageExamples: RecommendedExample[] = [
  {
    primary: 'Voca',
    secondary: 'chronic: 만성적인\npersistent: 지속적인\naccumulate: 축적하다'
  },
  {
    primary: 'Idium',
    secondary: 'come about : 발생하다\nqualify for : ~의 자격을 얻다'
  }
  
];

function refreshMessages(): RecommendedExample[] {
  return messageExamples;
}

const Title = styled.h2`
  text-align: center;
  margin-top: 20px;
`;
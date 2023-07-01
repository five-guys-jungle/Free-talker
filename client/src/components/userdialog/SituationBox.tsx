import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
    
    <Box sx={{ width: '70%', height: '70%', pb: 10 }}>
      <Title>Situation Recommendation</Title>
      <Box 
        sx={{ 
          overflow: 'auto', 
          height: '100%', 
          backgroundImage: 'linear-gradient(rgba(135,150,235, 0.7), rgba(164,181,235, 0.2))',
          // padding: '20px',
          borderRadius: '10px',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.1)',
          '@media screen and (max-width: 600px)': {
            borderRadius: '0px',
          },
          ':hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          }
        }} 
        ref={ref}
      >
        <Typography 
          className="Situation" 
          style={{ fontSize : "25px", fontFamily: "Arial", fontWeight: "bold", wordBreak: "break-word", paddingTop: "10px", paddingLeft: "5%", paddingRight: "5%"  }}>
            {situation}
        </Typography>
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



const Title = styled.h2`
  text-align: center;
  margin-top: 5%;
  font-size: 2rem;
  background: linear-gradient(45deg, rgba(135,150,250, 0.9), rgba(222,188,250, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;
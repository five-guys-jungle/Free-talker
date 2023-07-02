import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Recommendation, UserDialogState } from "../../stores/userDialogSlice";

const ScriptBox: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const recommendations = useSelector(
        (state: { userDialog: UserDialogState }) =>
            state.userDialog.recommendations
    );

  React.useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
  }, []);

  return (
    <Box sx={{ width: '70%', height: '70%', marginTop: '1%'}}>
      <Title>Sentence Recommendation</Title>
      <Box 
        sx={{ 
          overflow: 'auto', 
          height: '60%', 
          backgroundColor: 'rgba(255,255,255, 0.5)',
          // backgroundImage: 'linear-gradient(rgba(0,0,0, 0.2),rgba(255,255,255, 0.8), rgba(0,0,0, 0.2))',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.2)',
          border: '8px solid #0D92C8', // 테두리 추가

        }} 
        ref={ref}
      >
        <List>
          <ListItem>
              {/* <span font-size={"18px"} style={{ fontWeight: "bold", wordBreak: "break-word" }}>afsdfdddd
              asdddddddddfdsfasdfsda asdf sdfasdf sdafsdafsadafsdfdd
              ddasdddddddddfdsfasdfsdaafsdfddddasdddddddddfdsfasdfsdaafsdfddddasdddddddddfdsfasdfsda
              afsdfddddasdddddddddfdsfas
              dfsdaafsdfddddasdddddddddfdsfasdfsda
              afsdfddddasdddddddddfdsfasdfsdaafsdfddddasdddddddddfdsfasdfsdaafsdfd
              dddasdddddddddfdsfasdfsdaafsdfddddasdddddddddfdsfasdfsdaafsdfdddd
              asdddddddddfdsfasdfsdaaf
              sdfddddasdddddddddfdsfasdfsda 
              afsdfddddasdddddddddfdsfasdfsda
              afsdfddddasdddddddddfdsfasdfsda
              afsdfddddasdddddddddfdsfasdfsda
              afsdfddddasdddddddddfdsfasdfsda
              fdsddd</span> */}
            </ListItem>
          {recommendations.map((recommendation: Recommendation, index) => (
            <ListItem key={recommendation._id} style={{fontFamily: "Open Sans"}}>
              <span font-size={"18px"} style={{ fontWeight: "bold", wordBreak: "break-word" }}>{index+1} : {recommendation.recommendation}</span>
            </ListItem>
          ))}
          
        </List>
      </Box>
    </Box>
  );
};

export default ScriptBox;





const Title = styled.h2`
  text-align: center;
  margin-top: 0;
  font-size: 2rem;
  background: linear-gradient(45deg, rgba(13, 146, 200, 0.8), rgba(0, 0, 255,0.6) ,rgba(13, 146, 200, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  font-family: Poppins;
`;
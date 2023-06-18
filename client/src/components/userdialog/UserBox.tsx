import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Sample image URLs
const avatarImage1 = './assets/낸시.png';
const avatarImage2 = './assets/아담.png';

const Image = styled('img')({
  width: '200%',
  height: 'auto',
});

const UserBox: React.FC = () => {
  return (
    <>
      <Box
        textAlign="center"
        sx={{transform: 'translateY(100px)'}}
      >
        <Typography variant="h4">카페 직원과 손님이 되어서<div></div>대화를 시작해 보세요 </Typography>
      </Box>
      
      <Box 
        display="flex" 
        gap={25} 
        sx={{
          transform: 'translate(0%,100%)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign="center">
          <Image src={avatarImage1} alt="User Avatar" />
          <Typography variant="body1">User Name 1</Typography>
        </Box>
        <Box textAlign="center">
          <Image src={avatarImage2} alt="User Avatar" />
          <Typography variant="body1">User Name 2</Typography>
        </Box>
      </Box>
    </>
  );
};

export default UserBox;

import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Sample image URLs
const avatarImage1 = './assets/낸시.png';
const avatarImage2 = './assets/아담.png';

const Image = styled('img')`
  width: 150%;
  height: auto;
`;

const UserBoxContainer = styled(Box)`
  text-align: center;
  margin-bottom: 20px;
`;

const AvatarContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 200px;
  flex: 1;

  &:last-child {
    margin-right: 0;
  }
`;

const UserBoxWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
`;

const UserBox: React.FC = () => {
  return (
    <UserBoxWrapper>
      <UserBoxContainer>
        <Typography variant="h4">카페 직원과 손님이 되어서</Typography>
        <Typography variant="h4">대화를 시작해 보세요</Typography>
      </UserBoxContainer>

      <Box display="flex" flexDirection="row" >
        <AvatarContainer>
          <Image src={avatarImage1} alt="User Avatar" />
          <Typography variant="body1" align="center">User Name 1</Typography>
        </AvatarContainer>
        <AvatarContainer>
          <Image src={avatarImage2} alt="User Avatar" />
          <Typography variant="body1" align="center">User Name 2</Typography>
        </AvatarContainer>
      </Box>
    </UserBoxWrapper>
  );
};

export default UserBox;

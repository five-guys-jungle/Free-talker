import {
    OpenVidu,
    Session,
    StreamManager,
    SessionEventMap,
    Subscriber,
    Publisher,
  } from 'openvidu-browser';
  import { Game } from 'phaser';
  import { Socket } from 'socket.io-client';
  import { WebsocketProvider } from 'y-websocket';
  
  export type Event = React.ChangeEvent<HTMLInputElement>;
  
  export type VoiceProp = {
    session: Session | undefined;
    handleSession: (session?: Session | undefined) => void;
    roomKey: string;
    handleDrawerClose?: () => void;
    handleSocket?: (soc: Socket) => void;
  };
  
  export type YjsProp = {
    handleProvider?: (pro: WebsocketProvider) => void;
    provider?: WebsocketProvider;
    setLeftOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    leftOpen?: boolean;
    handleRightDrawerOpen?: () => void;
    handleLeftDrawerClose?: () => void;
  };
  
  export type GameType = Game & {
    socket?: Socket;
    socketId?: string;
    charKey?: string;
    userName?: string;
  };
  
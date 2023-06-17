import { Game } from "phaser";
import { Socket } from "socket.io-client";
import { WebsocketProvider } from "y-websocket";

export type Event = React.ChangeEvent<HTMLInputElement>;

export type GameType = Game & {
    socket?: Socket;
    socketId?: string;
    charKey?: string;
    userName?: string;
};

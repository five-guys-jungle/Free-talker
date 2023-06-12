import { v4 as uuidv4 } from 'uuid';
import { Server as SocketIOServer, Socket } from "socket.io";
import { Player, PlayerDictionary } from "../models/Player";

let players: PlayerDictionary = {};

export function socketEventHandler(socket: Socket)
{
    const userTempNickname: string = `${uuidv4()}`;; // Temperal nickname for user
    console.log('New client connected, userTempNickname: , socketid', userTempNickname, socket.id);
    socket.emit('connected', { socketId: socket.id, nickname: userTempNickname });

    // 클라이언트로부터 player가 생성되었다는 이벤트를 받으면 players에 추가
    socket.on('created', (playerInfo: { socketId: string, nickname: string, x: number, y: number }) => {
        // console.log('on: created ', playerInfo);
        players[playerInfo.nickname] = playerInfo;
        // socket.broadcast.emit('newPlayerCreated', players[playerInfo.nickname]);// broadcast를 통해 자신을 제외한 모든 클라이언트에게 이벤트 전달(본인 제외)
    });

    // Listen for movement events
    socket.on('playerMovement', (movementData: { socketId: string, nickname: string, x: number, y: number }) => {
        //cathcing player movement and updating player position
        players[movementData.nickname] = movementData;
        socket.broadcast.emit('playerMoved', players);// broadcast를 통해 자신을 제외한 모든 클라이언트에게 이벤트 전달(본인 제외)
    });

    socket.on('disconnect', (reason: string) => {
        console.log('Client disconnected, id, reason ', socket.id, reason);
    });
}
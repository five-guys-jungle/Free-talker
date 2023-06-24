import { Server as SocketIOServer, Socket } from "socket.io";
import { freedialogsocketEventHandler } from "./voiceController";   

let talkingPlaces:string[] = ["airport_chair1"];
const maxConnections = 2;
let currentConnections = 0;
export function createNamespace(io:SocketIOServer, namespace:string) {
    for(let name of talkingPlaces)
    {
        console.log("createNamespace: ", `${namespace}/${name}`);
        const freedialogSocket = io.of(`${namespace}/${name}`);
        // freedialogSocket.use((socket, next) => {
        //     if (currentConnections >= maxConnections) {
        //       next(new Error('Max connections limit reached'));
        //     } else {
        //       currentConnections++;
        //       next();
        //     }
        //     socket.on('disconnect', () => {
        //       currentConnections--;
        //     });
        //   });
        //   freedialogSocket.on('connection', (socket) => {
        //     console.log('A client connected.');
        //     // 이 부분에서 원하는 함수를 실행시킬 수 있습니다.
        //     socket.emit('message', currentConnections);
        //     socket.on('disconnect', () => {
        //       console.log('A client disconnected.');
        //     });
        //   });
        freedialogSocket.on("connection", freedialogsocketEventHandler);
    }
}
import { Server as SocketIOServer, Socket } from "socket.io";
import { userDialogSocketEventHandler } from "./userDialogController"; 
import { freeDialogSocketEventHandler } from './voiceController';  

let talkingPlaces:string[] = ["airport_chair1", "coach_park1","coach_park2", "chairMart"];
const maxConnections = 2;
let currentConnections = 0;
let socketEndpoint:string;
export function createNamespace(io:SocketIOServer, namespace:string) {
    for(let name of talkingPlaces)
    {
        socketEndpoint = `${namespace}/${name}`;
        if (socketEndpoint.includes('freedialog')){
            const freeDialogSocket = io.of(socketEndpoint);
            freeDialogSocket.on("connection", freeDialogSocketEventHandler);
        }
        else {
            const userDialogSocket = io.of(socketEndpoint);
            userDialogSocket.on("connection", userDialogSocketEventHandler);
        }        
    }
}
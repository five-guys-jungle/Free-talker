import { Server as SocketIOServer, Socket } from "socket.io";
import { userDialogSocketEventHandler } from "./userDialogController"; 
import { freeDialogSocketEventHandler } from './voiceController';  

let talkingPlaces:string[] = ["airport_chair1", "couch_park1","couch_park2","couch_park3", "couch_park4","couch_park5","couch_park6","couch_park7", "Mart", "Restaurant", "Cafe","Cafe2"];
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
import { Server as SocketIOServer, Socket } from "socket.io";
import { freedialogsocketEventHandler } from "./voiceController";   

let talkingPlaces:string[] = ["airport_chair1"];

export function createNamespace(io:SocketIOServer, namespace:string) {
    for(let name of talkingPlaces)
    {
        console.log("createNamespace: ", `${namespace}/${name}`);
        const freedialogSocket = io.of(`${namespace}/${name}`);
        freedialogSocket.on("connection", freedialogsocketEventHandler);
    }
}
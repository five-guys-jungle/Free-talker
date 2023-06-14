import { v4 as uuidv4 } from "uuid";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Player, PlayerDictionary } from "../models/Player";

let players: PlayerDictionary = {};
export function socketEventHandler(socket: Socket) {
    console.log("All players: ", players);
    console.log("New client connected, socketid: ", socket.id);
    socket.on("connected", (data: Player) => {
        console.log("connected, socketid: ", socket.id);
        console.log("connected, data: ", data);
        data.socketId = socket.id;
        players[socket.id] = data;
        if (players !== undefined && players !== null) {
            console.log("All players, connected, updateAlluser: ", players);
            socket.emit("updateAlluser", players);
        }
        socket.broadcast.emit("newPlayerConnected", data);
    });
    socket.on("playerMovement", (data: Player) => {
        console.log("playerMovement, socketid: ", socket.id);
        console.log("playerMovement, data: ", data);
        data.socketId = socket.id;
        players[socket.id] = data;
        console.log("All players, playerMovement: ", players);
        socket.broadcast.emit("playerMoved", data);
    });

    socket.on("disconnect", (reason: string) => {
        console.log("Client disconnected, id: ", socket.id, ", reason: ", reason);
        let playerDeleted: Player = players[socket.id];
        delete players[socket.id];
        socket.broadcast.emit("playerDeleted", playerDeleted);
    });
}

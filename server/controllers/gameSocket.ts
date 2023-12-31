import { Server as SocketIOServer, Socket } from "socket.io";
import { Player, PlayerDictionary } from "../models/Player";

let players_airport: PlayerDictionary = {};
let players_usa: PlayerDictionary = {};
export function socketEventHandler(socket: Socket) {
    console.log("Client connected, id: ", socket.id);
    // console.log("connect : ", socket);
    socket.on("connected", (data: Player) => {
        if (data.scene === "AirportScene") {
            data.socketId = socket.id;
            players_airport[socket.id] = data;

            socket.emit("updateAlluser", players_airport);
            socket.broadcast.emit("newPlayerConnected", players_airport[socket.id]);
        } else if (data.scene === "USAScene") {
            data.socketId = socket.id;
            players_usa[socket.id] = data;

            socket.emit("updateAlluser", players_usa);
            socket.broadcast.emit("newPlayerConnected", players_usa[socket.id]);
        }
    });
    socket.on("seat", (data: Player) => {
        // console.log("seat, data: ", data);   

        players_usa[data.socketId] = data;
        socket.broadcast.emit("otherseat", data);
    })
    socket.on("playerMovement", (data: Player) => {
        if (data.scene === "AirportScene") {
            // console.log("playerMovement, data: ", data);
            data.socketId = socket.id;
            players_airport[socket.id] = data;
            socket.broadcast.emit("playerMoved", players_airport[socket.id]);
        } else if (data.scene === "USAScene") {
            // console.log("playerMovement, data: ", data);
            data.socketId = socket.id;
            players_usa[socket.id] = data;
            socket.broadcast.emit("playerMoved", players_usa[socket.id]);
        }
    });

    socket.on("disconnect", (reason: string) => {
        console.log(
            "Client disconnected, id: ",
            socket.id,
            ", reason: ",
            reason
        );

        if (players_airport[socket.id] != null) {
            let playerDeleted: Player = players_airport[socket.id];
            delete players_airport[socket.id];
            // console.log("players_airport: ", players_airport);
            socket.broadcast.emit("playerDeleted", playerDeleted);
        } else if (players_usa[socket.id] != null) {
            let playerDeleted: Player = players_usa[socket.id];
            delete players_usa[socket.id];
            // console.log("players_usa: ", players_usa);
            socket.broadcast.emit("playerDeleted", playerDeleted);
        }
    });
}

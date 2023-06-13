import {
    Player,
    PlayerDictionary,
    PlayerInfo,
    PlayerInfoDictionary,
} from "../../characters/Player";
import io, { Socket } from "socket.io-client";

export class SocketHelper {
    socket: Socket | null = null;

    initialize() {
        this.socket = io("http://localhost:5000");
    }

    // onConnect(callback: () => void) {
    //     if (this.socket) {
    //         this.socket.on("connect", callback);
    //     }
    // }

    onConnected(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on("connected", callback);
        }
    }
    onPlayerDelete(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on("playerDelete", callback);
        }
    }
    onPlayerMoved(callback: (player: PlayerInfo) => void) {
        if (this.socket) {
            this.socket.on("playerMoved", callback);
        }
    }

    emitCreated(nickname: string, texture: string, x: number, y: number) {
        if (this.socket) {
            this.socket.emit("created", {
                socketId: this.socket.id,
                nickname: nickname,
                texture: texture,
                x: x,
                y: y,
            });
        }
    }

    emitPlayerMovement(
        nickname: string,
        texture: string,
        x: number,
        y: number
    ) {
        if (this.socket) {
            this.socket.emit("playerMovement", {
                socketId: this.socket!.id,
                nickname: nickname,
                texture: texture,
                x: x,
                y: y,
            });
        }
    }

    getSocket() {
        return this.socket;
    }
    getSocketId() {
        return this.socket?.id;
    }
}

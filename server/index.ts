import express, { Express, Request, Response } from "express";
import http from "http";
import cors from "cors";
import axios from "axios";
import path from "path";
// import { Router } from "express";
import { upload, interact } from "./controllers/interaction";
import {socketEventHandler} from "./controllers/gameSocket";
import { Server as SocketIOServer, Socket } from "socket.io";
// // import router from "./routes/basicRouter";
// // import http from 'http'; // Load in http module

const port = 5000;
const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server);

io.on('connection', socketEventHandler);


const allowedOrigins = [
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    "http://localhost:5000",
];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use(express.static(path.join(__dirname, "/audio/npc_audio")));
// app.use('/', require('./routes/basicRouter'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.get("/npc_audio/*", function (req: Request, res: Response) {
    console.log(path.join(__dirname, "npc_audio", req.params[0]));
    res.sendFile(path.join(__dirname, "npc_audio", req.params[0]));
});

app.post("/interact", upload.single("audio"), interact);

// export default router;

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

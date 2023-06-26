const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
import {  Socket } from "socket.io"	
const maxConnections = 2;
const freeRoom_Num: {
	[key: string]: number;
} = {
	airport_chair1: 0,
	coach_park: 0,
}

// freedialogsocketEventHandler 함수 수정
export function freedialogsocketEventHandler(socket: Socket) {
	console.log(socket.id, "connection---------------------------------");
	let temp: string = "";
	socket.on("join", (data: { place_name: string }) => {
		const { place_name } = data;
  		console.log("join: ", place_name);
		temp = place_name;
		if (freeRoom_Num[place_name] == maxConnections) {
			freeRoom_Num[place_name]++;
			socket.emit("roomFull");
			return;
		
		}

		else {

			freeRoom_Num[place_name]++;
			socket.emit("joined");
			console.log("freeRoom_Num: ", freeRoom_Num[place_name]);
			// socket.emit("joined",  freeRoom_Num[place_name] );
		}


		
	});
	socket.on("disconnect", () => {
		//   socket.broadcast.emit("callEnded");
		  console.log("disconnected~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		  freeRoom_Num[temp]--;
		  console.log("freeRoom_Num: ", freeRoom_Num[temp]);
		  socket.broadcast.emit("outcharacter");
		//   socket.broadcast.emit("disconnected", freeRoom_Num[place_name]);
		});
	socket.broadcast.emit("userconnected");
	
	socket.emit("me", socket.id);
	socket.on("otherchar", ({playerNickname: playerNickname, playerTexture:playerTexture}) =>{
		socket.broadcast.emit("otherusercharacter",{playerNickname: playerNickname, playerTexture:playerTexture})
	})
	socket.on("mychar", ({otherNickname: playerNickname, otherTexture:playerTexture}) =>{
		socket.broadcast.emit("usercharacter",{otherNickname: playerNickname, otherTexture:playerTexture})
	})
	// socket.on("disconnect", () => {
	// //   socket.broadcast.emit("callEnded");
	//   console.log("disconnected~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	// });
  
	socket.on("callUser", (data: { userToCall: any; signalData: any; from: any; name: any }) => {
	  console.log("callUser: 서버에서 데이터를 받았음");
	  socket.broadcast.emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
	});
  
	socket.on("answerCall", (data: { to: any; signal: any }) => {
	  console.log("answerCall: ", data);
	  socket.broadcast.emit("callAccepted", data.signal);
	});
  
	socket.on("callEnded", () => {
	  socket.broadcast.emit("otherusercallended");
	});
}
// 	socket.on("leaveCallEvent", () => {
// 		socket.broadcast.emit("otheruserleave");
// 	  });
//   }
  
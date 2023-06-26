const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
import {  Socket } from "socket.io"	
const maxConnections = 2;
const Room_Num: {
	[key: string]: number;
} = {
	airport_chair1: 0,
	coach_park: 0,
	chairMart: 0,
}
class Player_Role {
	Cashier: number;
	Customer: number;
  
	constructor(cashier: number, customer: number) {
	  this.Cashier = cashier;
	  this.Customer = customer;
	}
  }
  
  const Role_Num: {
	[key: string]: Player_Role;
  } = {
	chairMart: new Player_Role(0, 0)
  };
// freedialogsocketEventHandler 함수 수정
export function dialogsocketEventHandler(socket: Socket) {
	console.log(socket.id, "connection---------------------------------");
	let temp: string = "";
	socket.on("join", (data: { place_name: string }) => {
		const { place_name } = data;
  		console.log("join: ", place_name);
		temp = place_name;
		if (Room_Num[place_name] == maxConnections) {
			Room_Num[place_name]++;
			socket.emit("roomFull");
			return;
		}
		else {
			Room_Num[place_name]++;
			socket.emit("joined");
			console.log("Room_Num: ", Room_Num[place_name]);
			// socket.emit("joined",  Room_Num[place_name] );
		}
		if (place_name == "chairMart") {
			if (Role_Num[place_name].Cashier == 0 && Role_Num[place_name].Customer == 0) {
				socket.emit("Cashier");
				Role_Num[place_name].Cashier++;
			} else if (Role_Num[place_name].Cashier == 1 && Role_Num[place_name].Customer == 0) {
				socket.emit("Customer");
				Role_Num[place_name].Customer++;
			} else if (Role_Num[place_name].Cashier == 0 && Role_Num[place_name].Customer == 1) {
				socket.emit("Cashier");
				Role_Num[place_name].Cashier++;
			}


		}

		
	});
	socket.on("disconnect", () => {
		//   socket.broadcast.emit("callEnded");
		  console.log("disconnected~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		  Room_Num[temp]--;
		  console.log("Room_Num: ", Room_Num[temp]);
		  socket.broadcast.emit("outcharacter");
		//   socket.broadcast.emit("disconnected", Room_Num[place_name]);
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
  
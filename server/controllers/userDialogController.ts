const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
import { Socket } from "socket.io"	
import { preDefinedRole } from "../models/Role";

import { io } from "../index";
const maxConnections = 2;
const roomNum: {
	[key: string]: number;
} = {
	airport_chair1: 0,
	coach_park: 0,
	chairMart: 0,
}
let socketIdList:string[] = [];
// freedialogsocketEventHandler 함수 수정
export function userDialogSocketEventHandler(socket: Socket) {
	console.log(socket.id, "connection---------------------------------");
	let placeName: string = "";
	socket.on("join", (data: string) => {
		placeName = data;
  		console.log("join: ", placeName);

		if (roomNum[placeName] == maxConnections) {
			// roomNum[placeName]++;
			socket.emit("roomFull");
			return;
		}
		else {
			roomNum[placeName]++;
			socket.emit("joined");
			socketIdList.push(socket.id);
			// console.log("socketIdList: ", socketIdList);
			console.log("roomNum: ", roomNum[placeName]);
		}
		
		// console.log(`place Name : ${placeName}`);
		// if (roomNum[placeName] == 1) {
			

		// 	console.log("preDefinedRole: ", preDefinedRole);
		// 	console.log(`role1: ${preDefinedRole[placeName].role[0]}`);
		// 	console.log(`recommendations: ${preDefinedRole[placeName].recommendations[0]}`);
		// 	console.log(`situation: ${preDefinedRole[placeName].situation}`);
		// 	socket.emit("role1", { situation: preDefinedRole[placeName].situation, role : preDefinedRole[placeName].role[0], recommendations: preDefinedRole[placeName].recommendations[0] });
		// } else {
		// 	console.log("preDefinedRole: ", preDefinedRole);

		// 	console.log(`role2: ${preDefinedRole[placeName].role[1]}`);

		// 	console.log(`recommendations: ${preDefinedRole[placeName].recommendations[1]}`);
		// 	console.log(`situation: ${preDefinedRole[placeName].situation}`);
		// 	socket.emit("role2", { situation: preDefinedRole[placeName].situation, role : preDefinedRole[placeName].role[1], recommendations: preDefinedRole[placeName].recommendations[1] });
		// }

	});

	socket.on("userExit", (id:string) => {
		socketIdList = socketIdList.filter(item => item !== id);
	})


	socket.on("disconnect", () => {
		//   socket.broadcast.emit("callEnded");
		  console.log("disconnected~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		  roomNum[placeName]--;
		  // console.log("roomNum: ", roomNum[placeName]);
		  socket.broadcast.emit("outcharacter");
		//   socket.broadcast.emit("disconnected", roomNum[placeName]);
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
		socketIdList.push(socket.id);

		socket.emit("role", { situation: preDefinedRole[placeName].situation, role : preDefinedRole[placeName].role[0], recommendations: preDefinedRole[placeName].recommendations[0] });
	  socket.broadcast.emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
	});
  
	socket.on("answerCall", (data: { to: any; signal: any }) => {
	  console.log("answerCall: ", data);
		socketIdList.push(socket.id);
		socket.emit("role", { situation: preDefinedRole[placeName].situation, role : preDefinedRole[placeName].role[1], recommendations: preDefinedRole[placeName].recommendations[1] });

		console.log(`socketIdList[1] : ${socketIdList[1]}`)
		
		
		

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
  
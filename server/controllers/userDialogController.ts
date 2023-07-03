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
	
	Mart: 0,
	Restaurant: 0,
	Cafe:0,
}
let socketIdList:string[] = [];

class seat_position {
	first_position: string;
	second_position: string;

	constructor(first_position: string, second_position: string) {
		this.first_position = first_position;
		this.second_position = second_position;
	}
}
const seat_position_list: {
	[key: string]: seat_position;
} = {
	Mart: new seat_position("", ""),
	Restaurant: new seat_position("", ""),
	Cafe: new seat_position("", ""),
	couch_park4: new seat_position("", ""),
	couch_park5: new seat_position("", ""),
	couch_park6: new seat_position("", ""),
	couch_park7: new seat_position("", ""),
}
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

		if (seat_position_list[placeName].first_position === "" && seat_position_list[placeName].second_position === "") {
			seat_position_list[placeName].first_position = socket.id;
			console.log("-111111111111111`11111111111")
			socket.emit("seat_position", 1);
		}
		else if (seat_position_list[placeName].first_position && seat_position_list[placeName].second_position === "") {
			seat_position_list[placeName].second_position = socket.id;
			socket.emit("seat_position", 2);
		}
		else if (seat_position_list[placeName].first_position === "" && seat_position_list[placeName].second_position) {
			socket.emit("seat_position", 1);
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
		for (const key in seat_position_list) {
			if (seat_position_list.hasOwnProperty(key)) {
				const seatPosition = seat_position_list[key];
				if (seatPosition.first_position === socket.id || seatPosition.second_position === socket.id) {
					seatPosition.first_position = "";
					seatPosition.second_position = "";
				}
			}
		}
		console.log("seat_position_list: ", seat_position_list);
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
  
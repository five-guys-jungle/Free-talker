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
	couch_park1: 0,
	couch_park2: 0,
	couch_park3: 0,
	couch_park4: 0,
	couch_park5: 0,
	couch_park6: 0,
	couch_park7: 0,
	couch_park8: 0,
}

class seat_position {
	first_position: number;
	second_position: number;
  
	constructor(first_position: number, second_position: number) {
	  this.first_position = first_position;
	  this.second_position = second_position;
	}
}
	const seat_position_list: {
		[key: string]: seat_position;
	} = {
		couch_park1: new seat_position(0, 0),
		couch_park2: new seat_position(0, 0),
		couch_park3: new seat_position(0, 0),
		couch_park4: new seat_position(0, 0),
		couch_park5: new seat_position(0, 0),
		couch_park6: new seat_position(0, 0),
		couch_park7: new seat_position(0, 0),
	}

// freedialogsocketEventHandler 함수 수정
export function freeDialogSocketEventHandler(socket: Socket) {
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
		switch (place_name) {
			case "couch_park1":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].first_position = 1;
					console.log("-111111111111111`11111111111")
					socket.emit("seat_position", 1);
				}
				else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].second_position = 1;
					socket.emit("seat_position", 2);
				}
				else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
					socket.emit("seat_position", 1);
				}
				break;
			case "couch_park2":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].first_position = 1;
					console.log("-111111111111111`11111111111")
					socket.emit("seat_position", 1);
				}
				else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].second_position = 1;
					socket.emit("seat_position", 2);
				}
				else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
					socket.emit("seat_position", 1);
				}
				break;
			case "couch_park3":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].first_position = 1;
					console.log("-111111111111111`11111111111")
					socket.emit("seat_position", 1);
				}
				else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].second_position = 1;
					socket.emit("seat_position", 2);
				}
				else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
					socket.emit("seat_position", 1);
				}
				break;
			case "couch_park3":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].first_position = 1;
					console.log("-111111111111111`11111111111")
					socket.emit("seat_position", 1);
				}
				else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].second_position = 1;
					socket.emit("seat_position", 2);
				}
				else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
					socket.emit("seat_position", 1);
				}
				break;
			case "couch_park4":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].first_position = 1;
					console.log("-111111111111111`11111111111")
					socket.emit("seat_position", 1);
				}
				else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
					seat_position_list[place_name].second_position = 1;
					socket.emit("seat_position", 2);
				}
				else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
					socket.emit("seat_position", 1);
				}
				break;
			case "couch_park5":
				if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
						seat_position_list[place_name].first_position = 1;
						console.log("-111111111111111`11111111111")
						socket.emit("seat_position", 1);
					}
					else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
						seat_position_list[place_name].second_position = 1;
						socket.emit("seat_position", 2);
					}
					else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
						socket.emit("seat_position", 1);
					}
					break;
			case "couch_park6":
						if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
							seat_position_list[place_name].first_position = 1;
							console.log("-111111111111111`11111111111")
							socket.emit("seat_position", 1);
						}
						else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
							seat_position_list[place_name].second_position = 1;
							socket.emit("seat_position", 2);
						}
						else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
							socket.emit("seat_position", 1);
						}
						break;
			case "couch_park7":
							if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 0) {
								seat_position_list[place_name].first_position = 1;
								console.log("-111111111111111`11111111111")
								socket.emit("seat_position", 1);
							}
							else if (seat_position_list[place_name].first_position == 1 && seat_position_list[place_name].second_position == 0) {
								seat_position_list[place_name].second_position = 1;
								socket.emit("seat_position", 2);
							}
							else if (seat_position_list[place_name].first_position == 0 && seat_position_list[place_name].second_position == 1) {
								socket.emit("seat_position", 1);
							}
							break;
						
					
					
				

		
	}});
	socket.on("standup", (data) =>{
		console.log("standup: ", data);
		const  place_name  = data.place_name;
		if (data.seat_position ==1){
			seat_position_list[place_name].first_position --; 

		}
		else if (data.seat_position ==2){
			seat_position_list[place_name].second_position --;
		}
		console.log("standup")
		
		console.log("standup: ", seat_position_list);
	})
			
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
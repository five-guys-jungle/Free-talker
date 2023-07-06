const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
import { Socket } from "socket.io"
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
	couch_park1: new seat_position("", ""),
	couch_park2: new seat_position("", ""),
	couch_park3: new seat_position("", ""),
	couch_park4: new seat_position("", ""),
	couch_park5: new seat_position("", ""),
	couch_park6: new seat_position("", ""),
	couch_park7: new seat_position("", ""),
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

		if (seat_position_list[place_name].first_position === "" && seat_position_list[place_name].second_position === "") {
			seat_position_list[place_name].first_position = socket.id;
			socket.emit("seat_position", 1);
			socket.emit("userconnected");
			socket.broadcast.emit("userconnected");

		}
		else if (seat_position_list[place_name].first_position && seat_position_list[place_name].second_position === "") {
			seat_position_list[place_name].second_position = socket.id;
			socket.emit("seat_position", 2);
			socket.emit("userconnected");
			socket.broadcast.emit("userconnected");
		}
		else if (seat_position_list[place_name].first_position === "" && seat_position_list[place_name].second_position) {
			socket.emit("seat_position", 1);
			socket.emit("userconnected");
			socket.broadcast.emit("userconnected");
		}


	});
	

	socket.on("disconnect", () => {
		console.log("disconnected~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", socket.id);
		
		
		freeRoom_Num[temp]--;
		console.log("freeRoom_Num: ", freeRoom_Num[temp]);

		// console.log("seat_position_list: ", seat_position_list);
		for (const key in seat_position_list) {
			if (seat_position_list.hasOwnProperty(key)) {
				const seatPosition = seat_position_list[key];
				if (seatPosition.first_position === socket.id) {
					seatPosition.first_position = "";
					socket.broadcast.emit("outcharacter");
					
				}
				else if (seatPosition.second_position === socket.id) {
					seatPosition.second_position = "";
					socket.broadcast.emit("outcharacter");
				}
			}
		}
		// console.log("seat_position_list: ", seat_position_list);
	}
	);


	socket.on("otherchar", ({ playerNickname: playerNickname, playerTexture: playerTexture }) => {
		console.log("otherchar: ", playerNickname, playerTexture);
		socket.broadcast.emit("otherusercharacter", { playerNickname: playerNickname, playerTexture: playerTexture })
	})
	socket.on("mychar", ({ otherNickname: playerNickname, otherTexture: playerTexture }) => {
		console.log	("mychar: ", playerNickname, playerTexture);	
		socket.broadcast.emit("usercharacter", { otherNickname: playerNickname, otherTexture: playerTexture })
	})

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
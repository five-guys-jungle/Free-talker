import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import {Instance} from "simple-peer"
import io, { Socket } from "socket.io-client"
import { setSocketNamespace } from "../../stores/socketSlice"
import { current } from "@reduxjs/toolkit"
import { TalkBoxState } from "../../stores/talkBoxSlice";
import store, { RootState, useAppDispatch } from "../../stores";
import {setUserCharacter, clearcharacters} from "../../stores/userboxslice";
import axios from "axios";

let DB_URL: string = process.env.REACT_APP_SERVER_URL!;
const RTCaudio = () => {
    const [ me, setMe ] = useState("")
	const [ stream, setStream ] = React.useState<MediaStream | undefined>(undefined)
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState<any>()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	


	const dispatch = useAppDispatch();
	const myAudio = useRef<HTMLAudioElement>(null);
	const userAudio = useRef<HTMLAudioElement>(null);
	const connectionRef = useRef<Instance | null>(null);
	const socket = useRef<Socket | null>(null);

	const socketNamespace = useSelector(
		(state: { rtc: { socketNamespace: string } }) => state.rtc.socketNamespace
	);
    // const dispatch = useDispatch();
	console.log("setSocketNamespace:::", socketNamespace);

	
	const {playerNickname, playerTexture} = useSelector((state: RootState) => {return {...state.user}});
	const place_name = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
	useEffect(() => {
		socket.current = io(socketNamespace);
		navigator.mediaDevices
		  .getUserMedia({ video: false, audio: true })
		  .then((stream) => {
			setStream(stream);
			if (myAudio.current) {
			  myAudio.current.srcObject = stream;
			  console.log(myAudio.current.srcObject);
			}
		  });
		
		// const place_name = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
		console.log("place_name:::", place_name);
		// socket.current!.emit("join", { place_name });

		socket.current!.emit("join", { place_name });
		socket.current!.on("connect", () => {
			
			// socket.current!.on("joined", (current) => {
			// 	console.log("current:::", current);
			// 	num_User = current
			// })

			
			})
		socket.current!.on("roomFull", () => {
			socket.current!.disconnect();
			const clickEvent = new CustomEvent('exitcall', {
				detail: { message: "exitcall"}
			});
			window.dispatchEvent(clickEvent);
		})

		socket.current!.on("joined", () => {
			console.log("joined!!!!!!!!!!!!!!!!")
			const seatEvent = new CustomEvent('seat', {
				detail: { message: "seat"}
			});
			window.dispatchEvent(seatEvent);
		}
			)
		socket.current!.on("Cashier", () => {
			console.log("Cashier!!!!!!!!!!!!!!!!")
		})

		socket.current!.on("Customer", () => {
			console.log("Customer!!!!!!!!!!!!!!!!")
		})

		console.log("socket is connected: ", socket.current!.id);
		
			
			socket.current!.emit("otherchar", {playerNickname: playerNickname, playerTexture:playerTexture});
			socket.current!.on("otherusercharacter", ({playerNickname: playerNickname, playerTexture:playerTexture}) => {
				console.log(playerNickname,playerTexture)
				dispatch(setUserCharacter({playerNickname, playerTexture}));
			})
			socket.current!.on("otheruserleave", () => {
				const clickEvent = new CustomEvent('exitcall', {
					detail: { message: "exitcall"}
				});
				window.dispatchEvent(clickEvent);
				// socket.current!.disconnect();
			});
		socket.current!.on("userconnected", () => {
				console.log("connected~~~~~~~~~~~~~~~~~~~~~~~~~~!!!!!!!!!!!!");
				socket.current!.emit("mychar", {otherNickname: playerNickname, otherTexture:playerTexture});
				// callUser(idToCall);
				// document.getElementById("call-btn")?.click();
				// console.log("clickclickclick!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
			})
			socket.current!.on("usercharacter", ({otherNickname: playerNickname, otherTexture:playerTexture}) => {
				console.log(playerNickname, playerTexture);
				dispatch(setUserCharacter({playerNickname, playerTexture}));
			  });
			socket.current!.on("outcharacter", () => {
				console.log("outcharacter=========================================");

				dispatch(clearcharacters());
			});  
		// });// 상대방 소켓 연결 이벤트 핸들러
		
		socket.current!.on("me", (id) => {
			setMe(id);
			console.log("id:::", id)
		});

        socket.current!.on("callUser", (data) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
			console.log("callUser2222222222")
		});
		// useEffect에 callEnded 이벤트 핸들러 추가
		socket.current!.on("otherusercallended", () => {
			setCallEnded(true);
			if (connectionRef.current) {
				connectionRef.current.destroy();
			}
		});
		return () => {
			socket.current!.disconnect();
		}
	  
	
	}, []);


       

    const callUser = async(id: string) => {
		console.log("id:", id)
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data: any) => {
			console.log("111111111111111")
			socket.current!.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			console.log("audio ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length > 0) {
				const audioStream = new MediaStream();
				audioStream.addTrack(audioTracks[0]);
				userAudio.current!.srcObject = audioStream;
			}
			// userAudio.current!.srcObject = stream;
		});
		socket.current!.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
			fetchData();
		});
		// try {
		// 	const response = await axios.get(`${DB_URL}/userdialog/place`, {
		// 		params: {
		// 			place_name: place_name // place_name you want to send
		// 		}
		// 	});
		// 	console.log(response.data);
		// } catch (error) {
		// 	console.error(`Error in sending place_name: ${error}`);
		// }
		connectionRef.current = peer
	}

	const fetchData = async () => {
		try {
			const response = await axios.get(`${DB_URL}/userdialog/place`, {
				params: {
					place_name: place_name // place_name you want to send
				}
			});
			console.log(response.data);
		} catch (error) {
			console.error(`Error in sending place_name: ${error}`);
		}
	};
	const answerCall = async () =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		});
		peer.on("signal", (data) => {
			socket.current!.emit("answerCall", { signal: data, to: caller })
		});
		peer.on("stream", (stream) => {
			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length > 0) {
			  const audioStream = new MediaStream();
			  audioStream.addTrack(audioTracks[0]);
			  userAudio.current!.srcObject = audioStream;
			}
			// userAudio.current!.srcObject = stream;
		  });

		peer.signal(callerSignal)

		connectionRef.current = peer
		fetchData();
		// Send place_name using GET request
		// try {
		// 	const response = await axios.get(`${DB_URL}/userdialog/place`, {
		// 		params: {
		// 			place_name: place_name // place_name you want to send
		// 		}
		// 	});
		// 	console.log(response.data);
		// } catch (error) {
		// 	console.error(`Error in sending place_name: ${error}`);
		// }
	};

	const leaveCall = () => {
		setCallEnded(true);
		if (connectionRef.current) {
			connectionRef.current.destroy();
			socket.current!.emit("callEnded"); // 서버로 callEnded 이벤트 전송
			socket.current!.emit("leaveCallEvent", { to: caller });
			// Airport 씬으로 이벤트 전달
			window.dispatchEvent(new Event("exitcall"));
			socket.current!.disconnect();
		   
			
		}
	  };

	  return (
		<>
		  <div
			style={{
			  display: "flex",
			  justifyContent: "center",
			  alignItems: "center",
			}}
		  >
			<div
			  className="call-button"
			  style={{ position: "fixed", textAlign: "center", top: "5px" }}
			>
			  {callAccepted && !callEnded ? (
				<div
				  className="caller"
				  style={{
					display: "inline-flex",
					alignItems: "center",
					bottom: "5px",
				  }}
				>
				  <IconButton
					color="secondary"
					aria-label="endcall"
					onClick={leaveCall}
				  >
					<PhoneIcon fontSize="large" />
				  </IconButton>
				  <h4>(카페 직원)이 되어 대화를 시작해 보세요</h4>
				</div>
			  ) : (
				<div
				  className="caller"
				  style={{
					display: "inline-flex",
					alignItems: "center",
					bottom: "5px",
				  }}
				>
					
				<IconButton
				  className="call-btn"
				  color="primary"
				  aria-label="call"
				  onClick={() => callUser(idToCall)}
				>
					
				  <PhoneIcon fontSize="large" />
				</IconButton>
				<h4>통화를 걸어 다른 유저와 상황극을 시작해 보세요</h4>
				</div>
			  )}
			  
			  {receivingCall && !callAccepted && (
				<div
				  className="caller"
				  style={{
					display: "inline-flex",
					alignItems: "center",
					bottom: "5px",
				  }}
				>
				  <h1> {name} is calling... </h1>
				  <Button variant="contained" color="primary" onClick={answerCall}>
					Answer
				  </Button>
				</div>
			  )}
			  {idToCall}
			</div>
		  </div>
		  <div
			className="container"
			style={{
			  flexDirection: "column",
			  alignItems: "center",
			  justifyContent: "center",
			  paddingTop: "50px",
			}}
		  >
			<div
			  className="audio-container"
			  style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				marginTop: "30px",
			  }}
			>
			  <div
				className="audio"
				style={{
				  display: "flex",
				  justifyContent: "center",
				  alignItems: "center",
				  width: "100%",
				  height: "100%",
				  marginBottom: "30px",
				}}
			  >
				{stream && (
				  <audio
					ref={myAudio}
					autoPlay
					style={{ width: "50%", margin: "auto" }}
				  />
				)}
			  </div>
			  <div
				className="audio"
				style={{
				  display: "flex",
				  justifyContent: "center",
				  alignItems: "center",
				  width: "100%",
				  height: "100%",
				}}
			  >
				{callAccepted && !callEnded ? (
				  <audio
					ref={userAudio}
					autoPlay
					style={{ width: "50%", margin: "auto" }}
				  />
				) : null}
			  </div>
			</div>
		  </div>
		</>
	  );
	};
	
	export default RTCaudio;
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import Typography from '@mui/material/Typography';
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
import { UserDialogState, setSituation, clearSituation, setRole, clearRole, appendRecommendation, clearRecommendations } from "../../stores/userDialogSlice";
import axios from "axios";

// let DB_URL: string = process.env.REACT_APP_SERVER_URL!;

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
	

	const playerRole = useSelector(
		(state: { userDialog: UserDialogState }) =>
				state.userDialog.role
	)


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
	const placeName = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
	// let placeName = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
	// switch (placeName) {
	// 	case "chairMart":
	// 	  placeName = "MART";
	// 	  break;
	//   }
	useEffect(() => {
		socket.current = io(socketNamespace);
		navigator.mediaDevices
		  .getUserMedia({ video: false, audio: true })
		  .then((stream) => {
			setStream(stream);
			if (myAudio.current) {
			  myAudio.current.srcObject = stream;
			  myAudio.current.volume = 0;
			  console.log(myAudio.current.srcObject);
			}
		  });
		
		// const placeName = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
		console.log("placeName:::", placeName);
		// socket.current!.emit("join", { placeName });

		socket.current!.emit("join", placeName);
		socket.current!.on("connect", () => {
			console.log("connect!!!!!");
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
			
		}
			)
		socket.current!.on("role", (data: any) => {
			console.log("role : ", data);
			dispatch(setSituation({ situation: data.situation }));
			dispatch(setRole({ role: data.role}));
			data.recommendations.forEach((recommendation:string, index:number) => {
				store.dispatch(
						appendRecommendation({
								_id: index.toString(),
								recommendation: recommendation,
						})
				);
		});
			
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
				const clickEvent = new CustomEvent('exitcall', {
							detail: { message: "exitcall"}
						});
						window.dispatchEvent(clickEvent);
						socket.current!.disconnect();
			}
		});
		return () => {
			// socket.current!.emit("out_Role" , {playerRole: playerRole, placeName: placeName});
			socket.current!.emit("userExit", socket.current!.id);
			socket.current!.disconnect();
			store.dispatch(clearRecommendations());

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
			// fetchData();
		});
		// try {
		// 	const response = await axios.get(`${DB_URL}/userdialog/place`, {
		// 		params: {
		// 			placeName: placeName // placeName you want to send
		// 		}
		// 	});
		// 	console.log(response.data);
		// } catch (error) {
		// 	console.error(`Error in sending placeName: ${error}`);
		// }
		connectionRef.current = peer
	}

	// const fetchData = async () => {
	// 	try {
	// 		const response = await axios.get(`${DB_URL}/userdialog/place`, {
	// 			params: {
	// 				placeName: placeName // placeName you want to send
	// 			}
	// 		});
	// 		console.log(response.data); // martChair -> 
	// 	} catch (error) {
	// 		console.error(`Error in sending placeName: ${error}`);
	// 	}
	// };

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

		peer.signal(callerSignal);

		connectionRef.current = peer;
		// fetchData();
	};

	const leaveCall = () => {
		setCallEnded(true);
		store.dispatch(clearRecommendations());
		if (connectionRef.current) {
			connectionRef.current.destroy();
			socket.current!.emit("callEnded"); // 서버로 callEnded 이벤트 전송
			// socket.current!.emit("out_Role2" , {playerRole: playerRole});
			socket.current!.emit("leaveCallEvent", { to: caller });
			// Airport 씬으로 이벤트 전달
			socket.current!.emit("userExit", socket.current!.id);
			window.dispatchEvent(new Event("exitcall"));
			socket.current!.disconnect();
		}
	  };

	  useEffect(() => {
		store.dispatch(clearRecommendations());
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'e' || event.key === 'E') {
				setCallEnded(true);
		
				if (connectionRef.current) {
					connectionRef.current.destroy();
					socket.current!.emit("callEnded"); // 서버로 callEnded 이벤트 전송
					// socket.current!.emit("out_Role2" , {playerRole: playerRole});
					socket.current!.emit("leaveCallEvent", { to: caller });
					// Airport 씬으로 이벤트 전달
					socket.current!.emit("userExit", socket.current!.id);
					window.dispatchEvent(new Event("exitcall"));
					socket.current!.disconnect();
				}
			}
		};
	
		window.addEventListener('keydown', handleKeyDown);
	
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	  return (
		<>
		<div
			style={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			width: "100%"
			}}>
			<div
			  className="call-button"
			  style={{ position: "fixed", textAlign: "center", top: "5%" }}>
			  {callAccepted && !callEnded ? (
				<div
				  className="caller"
				  style={{
					display: "inline-flex",
					alignItems: "center",
				  }}>

				<IconButton
					color="secondary"
					aria-label="endcall"
					onClick={leaveCall}>
					<PhoneIcon style={{ fontSize: "3em" }} />
				</IconButton>
				<Typography variant="h5" align="center" style={{ fontFamily: "Arial", fontWeight: "bold" }}>통화를 종료하면 맵으로 돌아갑니다.</Typography>
				</div>
			) : receivingCall && !callAccepted ? null : (
				<div
					className="caller"
					style={{ 
						display: "inline-flex",
						alignItems: "center", 
						bottom: "5px"
					}}>
					<IconButton
						className="call-btn"
						color="primary"
						aria-label="call"
						onClick={() => callUser(idToCall)}>
						<PhoneIcon style={{ fontSize: "3em" }} />
					</IconButton>
					<Typography variant="h4" align="center" style={{ fontFamily: "Arial", fontWeight: "bold"}}>Make a call</Typography>
				</div>
				)}
				
				{receivingCall && !callAccepted && (
					<div className="caller" style={{ display: 'inline-flex', alignItems: 'center'}}>
						<Typography variant="h5" align="center" style={{ fontFamily: "Arial", fontWeight: "bold" }}> Please answer the call ... </Typography>
						<Button variant="contained" color="primary" onClick={answerCall} style={{marginLeft: '10px'}}>
							Answer
						</Button>
					</div>
				)}
				<Typography fontSize={"35px"} align="center" marginTop={"10%"}>
					My role is <span style={{ color: "#C70039" }}>{playerRole}</span>
				</Typography>
				<Typography fontSize={"35px"}>Place is <span style={{ color: "#C70039" }}>{placeName}</span></Typography>
			</div>	
		</div>
			<div
				className="container"
				style={{
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				paddingTop: "50px",
				}}>
			<div
			  className="audio-container"
			  style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				marginTop: "30px",
			}}>
			<div
				className="audio"
				style={{
				  display: "flex",
				  justifyContent: "center",
				  alignItems: "center",
				  width: "100%",
				  height: "100%",
				  marginBottom: "30px",
			}}>
				{stream && (
				  <audio
					ref={myAudio}
					autoPlay
					style={{ width: "50%", margin: "auto" }}/>
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
				}}>
				{callAccepted && !callEnded ? (
				  <audio
					ref={userAudio}
					autoPlay
					style={{ width: "50%", margin: "auto" }}/>
				) : null}
			  	</div>
			</div>
		</div>
		</>
	  );
	};
	
	export default RTCaudio;
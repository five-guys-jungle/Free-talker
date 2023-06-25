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
import {setUserCharacter} from "../../stores/userboxslice";

const FreeDialog = () => {
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
	const myVideo = React.useRef<HTMLVideoElement>(null);
	const userVideo = React.useRef<HTMLVideoElement>(null);
	const connectionRef = React.useRef<Instance | null>(null);
    const socket = useRef<Socket | null>(null);

	const socketNamespace = useSelector(
		(state: { rtc: { socketNamespace: string } }) => state.rtc.socketNamespace
	);
    // const dispatch = useDispatch();
	console.log("setSocketNamespace:::", socketNamespace);

	
	const {playerNickname, playerTexture} = useSelector((state: RootState) => {return {...state.user}});

    useEffect(() => {
		socket.current = io(socketNamespace);
		// socket.current = io("http://localhost:5000/freedialog/airport_chair1");
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            if (myVideo.current) {
                myVideo.current.srcObject = stream
				console.log(myVideo.current.srcObject)
            }
        })
		
		const place_name = socketNamespace.substring(socketNamespace.lastIndexOf("/") + 1);
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


       

    const callUser = (id: string) => {
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
			console.log("video~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
			userVideo.current!.srcObject = stream;
			
		});
		socket.current!.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.current!.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current!.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true);
		if (connectionRef.current) {
			connectionRef.current.destroy();
			socket.current!.emit("callEnded"); // 서버로 callEnded 이벤트 전송
			socket.current!.emit("leaveCallEvent", { to: caller });
			socket.current!.disconnect();
		   // Airport 씬으로 이벤트 전달
			window.dispatchEvent(new Event("exitcall"));
			
		}
	  };

		return (
			<>
				<div style={{ 
					display: 'flex', 
					justifyContent: 'center', 
					alignItems: 'center', 
				}}>
					
					<div className="call-button" style={{ position: 'fixed', textAlign: 'center', top: '5px'}}>
						
						{callAccepted && !callEnded ? (
							<div className="caller" style={{ display: 'inline-flex', alignItems: 'center', bottom : '5px' }}>

							<IconButton color="secondary" aria-label="endcall" onClick={leaveCall}>
								<PhoneIcon fontSize="large" /> 
							</IconButton>
							<h4>통화를 종료하면 맵으로 돌아갑니다.</h4>
							</div>
						) : (
							
						  	<IconButton className="call-btn" color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
						  		<PhoneIcon fontSize="large" />
						  	</IconButton>
							
						  )} 
						  
						{receivingCall && !callAccepted && (
							<div className="caller" style={{ display: 'inline-flex', alignItems: 'center', bottom : '5px' }}>
								<h1> {name} is calling... </h1>
								<Button variant="contained" color="primary" onClick={answerCall}>
									Answer
								</Button>
								
							</div>
						)}
						{idToCall}  
						</div>

				</div>
				<div className="container" style={{ 
					flexDirection: "column", 
					alignItems: "center", 
					justifyContent: "center", 
					paddingTop: "50px" 
				}}> 					
					<div className="video-container" style={{ 
						display: "flex", 
						flexDirection: "column", 
						alignItems: "center", 
						justifyContent: "center", 
						width: "100%",
						marginTop: "30px", 
						transform: "scaleX(-1)" 
					}}>
						<div className="video" style={{ 
							display: "flex", 
							justifyContent: "center", 
							alignItems: "center",
							width: "100%",
							height: "100%",
							marginBottom: "30px",
						}}>
							{stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "50%",  margin: "auto"}} />}
						</div>
						{/* <div className="video" style={{ 
							display: "flex", 
							justifyContent: "center", 
							alignItems: "center",
							width: "100%",
							height: "100%",
						}}>
							{callAccepted && !callEnded ?
								<video playsInline ref={userVideo} autoPlay style={{width: "50%", margin: "auto"  }} /> :
								(stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "50%",  margin: "auto" }} />)
							}
						</div> */}
						<div className="video" style={{ 
							display: "flex", 
							justifyContent: "center", 
							alignItems: "center",
							width: "100%",
							height: "100%",
						}}>
							{callAccepted && !callEnded ?
								<video playsInline ref={userVideo} autoPlay style={{ width: "50%", margin: "auto" }} /> :
								null}
						</div>


					</div>
		
					
		
				</div>
			</>
		)
		

				  }
export default FreeDialog;
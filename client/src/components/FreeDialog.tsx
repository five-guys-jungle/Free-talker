import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const FreeDialog = () => {
  console.log("FreeDialog");
  const socketRef = useRef<Socket>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection>();

  const  roomName  = 'sangsu';

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
        console.log(myVideoRef);
      }
      if (!(pcRef.current && socketRef.current)) {
        console.log('1111111')
        return;
      }
      stream.getTracks().forEach((track) => {
        if (!pcRef.current) {
            console.log('2222222')  
          return;
        }
        pcRef.current.addTrack(track, stream);
        console.log("add track");
      });

      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
            console.log('3333333')
          if (!socketRef.current) {
            console.log('4444444')  
            return;
          }
          console.log("recv candidate");
          socketRef.current.emit("candidate", e.candidate, roomName);
        }
        console.log("onicecandidate");  
      };

      pcRef.current.ontrack = (e) => {
        if (remoteVideoRef.current) {
            console.log(remoteVideoRef);
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    console.log("create Offer");
    if (!(pcRef.current && socketRef.current)) {
      return;
    }
    try {
      const sdp = await pcRef.current.createOffer();
      pcRef.current.setLocalDescription(sdp);
      console.log("sent the offer");
      socketRef.current.emit("offer", sdp, roomName);
      const answer = await new Promise<RTCSessionDescription>((resolve, reject) => {
        socketRef.current!.once("getAnswer", (sdp: RTCSessionDescription) => {
          resolve(sdp);
        });
      });
      console.log("recv Answer");
      pcRef.current.setRemoteDescription(answer);
    } catch (e) {
      console.error(e);
    }
  };

  const createAnswer = async (sdp: RTCSessionDescription) => {
    console.log("createAnswer");
    if (!(pcRef.current && socketRef.current)) {
      return;
    }

    try {
      pcRef.current.setRemoteDescription(sdp);
      const answerSdp = await pcRef.current.createAnswer();
      pcRef.current.setLocalDescription(answerSdp);

      console.log("sent the answer");
      socketRef.current.emit("answer", answerSdp, roomName);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initializeVideoChat = async () => {  
    console.log("useEffect");
    socketRef.current = io("localhost:5000/freedialog");
    console.log("socketRef.current", socketRef.current);
    pcRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    socketRef.current.on("all_users", (allUsers: Array<{ id: string }>) => {
      console.log("all_users", allUsers);
        if (allUsers.length > 0) {
        console.log("all_users", allUsers);
        createOffer();
      }
    });

    socketRef.current.on("getOffer", (sdp: RTCSessionDescription) => {
      console.log("recv Offer");
      createAnswer(sdp);                                                                                                 
    });

    socketRef.current.on("getAnswer", (sdp: RTCSessionDescription) => {
      console.log("recv Answer");
      if (!pcRef.current) {
        return;
      }
      pcRef.current.setRemoteDescription(sdp);
    });

    socketRef.current.on("getCandidate", async (candidate: RTCIceCandidate) => {
      if (!pcRef.current) {
        return;
      }

      await pcRef.current.addIceCandidate(candidate);
    });

    socketRef.current.emit("join_room", {
      room: roomName,
    });

    await getMedia();


    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
}
    initializeVideoChat();
  }, []);

  return (
    <div>
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          backgroundColor: "black",
        }}
        ref={myVideoRef}
        autoPlay
      />
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          backgroundColor: "black",
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </div>
  );
};

export default FreeDialog;
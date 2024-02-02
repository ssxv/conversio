"use client"
import { useContext, useEffect, useRef, useState } from "react"
import * as Peer from "simple-peer"
import { WebsocketContext } from "./App"
import { canGetUserMedia, getMediaStream } from "@/lib/util";
import { SOCKET_SERVER_EVENT } from "@/lib/data";

export default function VideoCall({ fromUser, toUser, callInitiated }) {

    const { socket } = useContext(WebsocketContext);

    const [myStream, setMyStream] = useState();
    const [callerPeersSignalData, setCallerPeersSignalData] = useState(null);
    const [callerUser, setCallerUser] = useState(null);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);

    const myVideoRef = useRef();
    const theirVideoRef = useRef();
    const callerPeerRef = useRef();
    const receiverPeerRef = useRef();

    // useEffect(() => {
    //     initiateCall();
    // }, [callInitiated]);

    useEffect(() => {

        if (canGetUserMedia()) {
            getMediaStream(true, true, (stream) => {
                if (myVideoRef.current) {
                    if ('srcObject' in myVideoRef.current) {
                        myVideoRef.current.srcObject = stream;
                    } else {
                        myVideoRef.current.src = URL.createObjectURL(stream);
                    }
                }
                setMyStream(stream);
            });
        }

        if (socket) {
            console.log("incoming CALL_REQUEST, CALL_DECLINED listener ON");
            socket.on(SOCKET_SERVER_EVENT.CALL_REQUEST, incommingCallRequestEventHandler);
            socket.on(SOCKET_SERVER_EVENT.CALL_DECLINED, incommingCallDeclinedEventHandler);
        }
        return () => {
            if (socket) {
                console.log("incoming CALL_REQUEST, CALL_DECLINED listener OFF");
                socket.off(SOCKET_SERVER_EVENT.CALL_REQUEST);
                socket.off(SOCKET_SERVER_EVENT.CALL_DECLINED);
            }
        }
    }, [socket, incomingCall]);

    const incommingCallRequestEventHandler = ({ fromUser, signalData }) => {
        console.log("in CALL_REQUEST listener");
        setIncomingCall(true);
        setCallerUser(fromUser);
        setCallerPeersSignalData(signalData);
    };

    const incommingCallDeclinedEventHandler = () => {
        setIncomingCall(false);
        setCallerUser(null);
        setCallerPeersSignalData(null);
    };

    const initiateCall = () => {

        const callerPeer = new Peer({ initiator: true, trickle: false, stream: myStream });

        callerPeer.on("signal", (signalData) => {
            console.log('initiateCall peer.on "signal"');
            socket.emit(SOCKET_SERVER_EVENT.CALL_REQUEST, {
                fromUser,
                toUser,
                signalData,
            });
        })

        callerPeer.on("stream", (stream) => {
            console.log('peer.on incoming "stream"');
            theirVideoRef.current.srcObject = stream;
        })

        console.log("incoming CALL_ANSWERED listener ON");
        if (socket) {
            socket.on(SOCKET_SERVER_EVENT.CALL_ANSWERED, ({ signalData }) => {
                callerPeer.signal(signalData);
                setCallAccepted(true);
            });
        }

        callerPeerRef.current = callerPeer;
    }

    const answerCall = () => {
        const receiverPeer = new Peer({ initiator: false, trickle: false, stream: myStream });

        receiverPeer.on("signal", (signalData) => {
            console.log('answerCall peer.on "signal"');
            socket.emit(SOCKET_SERVER_EVENT.CALL_ANSWERED, {
                fromUser,
                toUser,
                signalData,
            });
        })

        receiverPeer.on("stream", (stream) => {
            console.log('peer.on "stream"');
            theirVideoRef.current.srcObject = stream;
        })

        receiverPeer.signal(callerPeersSignalData);
        setIncomingCall(false);
        setCallAccepted(true);
        receiverPeerRef.current = receiverPeer;
    }

    const declineCall = () => {
        setIncomingCall(false);
        setCallerUser(false);
        receiverPeerRef.current && receiverPeerRef.current.destroy();
        socket.emit(SOCKET_SERVER_EVENT.CALL_DECLINED, {
            fromUser,
            toUser,
        });
    }

    const endCall = () => {
        setCallAccepted(false);
        setCallerUser(null);
        callerPeerRef.current && callerPeerRef.current.destroy();
        receiverPeerRef.current && receiverPeerRef.current.destroy();
    }

    return (
        <div className="video-call">
            <div className="video-call-header">
                <div className="display-vertical-center">
                    <div className="mb-2">
                        <video ref={myVideoRef} className="video-call-my-video" autoPlay />
                    </div>
                    <div className="flex-1">
                        <video ref={theirVideoRef} className="video-call-their-video" autoPlay />
                    </div>
                </div>
            </div>
            {incomingCall && callerUser && <div className="recent-users-loading-info">Incoming call from {callerUser.name}</div>}
            <div className="video-call-footer">
                <div className="display-horizontal">
                    <div className="ml-auto mr-auto">
                        {incomingCall && <>
                            <button className="button-primary mr-2" onClick={answerCall}>Answer Call</button>
                            <button className="button-primary" onClick={declineCall}>Decline Call</button>
                        </>
                        }

                        {callAccepted && <>
                            <button className="button-primary" onClick={endCall}>End Call</button>
                        </>
                        }

                        {!incomingCall && !callAccepted && <button className="button-primary" onClick={initiateCall}>Call</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}

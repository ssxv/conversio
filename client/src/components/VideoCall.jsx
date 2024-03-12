"use client"

import { useContext, useEffect, useRef, useState } from "react"
import * as Peer from "simple-peer"
import { CurrentUserContext, WebsocketContext } from "./App"
import { canGetUserMedia, getMediaStream, getVideoDevice, timeout } from "@/lib/util";
import { SOCKET_SERVER_EVENT } from "@/lib/data";
import { VideoOff } from "lucide-react";

export default function VideoCall({ initiateVideoCall, answerVideoCall, onClose }) {

    const { currentUser } = useContext(CurrentUserContext);
    const { socket } = useContext(WebsocketContext);

    const [calling, setCalling] = useState(false);
    const [callAccepted, setCallAccepted] = useState(false);

    const myStreamRef = useRef(null);
    const myVideoRef = useRef(null);
    const theirVideoRef = useRef(null);
    const peerRef = useRef(null);

    // initiateVideoCall
    useEffect(() => {
        if (initiateVideoCall && canGetUserMedia() && !myStreamRef.current && !peerRef.current) {
            startCamera();
        }

        return () => {
            if (myStreamRef.current && peerRef.current) {
                closeCamera();
                if (socket) {
                    socket.off(SOCKET_SERVER_EVENT.CALL_ANSWERED);
                    console.log("CALL_ANSWERED listener OFF");
                }
                setCalling(false);
            }
        };
    }, [initiateVideoCall]);

    // answerVideoCall
    useEffect(() => {
        if (answerVideoCall && canGetUserMedia() && !myStreamRef.current && !peerRef.current) {
            startCamera(answerVideoCall.signalData);
        }

        return () => {
            if (myStreamRef.current && peerRef.current) {
                closeCamera();
                setCallAccepted(false);
            }
        };
    }, [answerVideoCall]);

    const startCamera = async (signalData) => {
        const myStream = await getMediaStream(true, true);
        if (!myStream) return;

        attachStreamToVideoRef(myStream);
        myStreamRef.current = myStream;

        if (signalData) {   // answering a call
            const receiverPeer = createReceiverPeer(myStream);
            peerRef.current = receiverPeer;
            receiverPeer.signal(answerVideoCall.signalData);
            setCalling(false);
            setCallAccepted(true);
        } else {            // initiating a call
            peerRef.current = createCallerPeer(myStream);
            if (socket) {
                socket.on(SOCKET_SERVER_EVENT.CALL_ANSWERED, callAnsweredEventHandler);
                console.log("CALL_ANSWERED listener ON");
            }
            setCalling(true);
            setCallAccepted(false);
        }
    }

    const closeCamera = () => {
        peerRef.current.destroy();
        peerRef.current = null;
        stopStream();
        detachStreamFromVideoRef();
        myStreamRef.current = null;
        myVideoRef.current = null;
    }

    const attachStreamToVideoRef = (myStream) => {
        if (myVideoRef.current) {
            if ('srcObject' in myVideoRef.current) {
                myVideoRef.current.srcObject = myStream;
            } else {
                myVideoRef.current.src = URL.createObjectURL(myStream);
            }
        }
    }

    const detachStreamFromVideoRef = () => {
        if (myVideoRef.current) {
            myVideoRef.current.pause();
            myVideoRef.current.srcObject = null;
            myVideoRef.current.load();
        }
    }

    const createCallerPeer = (myStream) => {

        const callerPeer = new Peer({ initiator: true, trickle: false, stream: myStream });

        callerPeer.on("signal", (signalData) => {
            socket.emit(SOCKET_SERVER_EVENT.CALL_REQUEST, {
                from: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                },
                toUserId: initiateVideoCall.to.id,
                signalData,
            });
        });

        callerPeer.on("stream", (theirStream) => {
            theirVideoRef.current.srcObject = theirStream;
        });

        return callerPeer;
    }

    const createReceiverPeer = (myStream) => {

        const receiverPeer = new Peer({ initiator: false, trickle: false, stream: myStream });

        receiverPeer.on("signal", (signalData) => {
            socket.emit(SOCKET_SERVER_EVENT.CALL_ANSWERED, {
                fromUserId: answerVideoCall.from.id,
                by: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                },
                signalData: signalData,
            });
        });

        receiverPeer.on("stream", (theirStream) => {
            theirVideoRef.current.srcObject = theirStream;
        });

        return receiverPeer;
    }

    const callAnsweredEventHandler = ({ signalData }) => {
        peerRef.current.signal(signalData);
        setCalling(false);
        setCallAccepted(true);
    }

    const stopStream = () => {
        if (!myStreamRef.current) return;

        myStreamRef.current.getTracks().filter((track) => track.readyState === "live").forEach((track) => {
            if (track.readyState === "live") {
                track.stop();
            }
        });
    }

    const endCall = () => {
        socket.emit(SOCKET_SERVER_EVENT.CALL_ENDED, {
            toUserId: initiateVideoCall?.to?.id || answerVideoCall?.from?.id,
            by: {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
            },
        });
        onClose();
    }

    if (!initiateVideoCall && !answerVideoCall) return null;

    return (
        <div className="video-call">
            <div className="video-call-header">
                <div className="display-vertical-center">
                    <div className="video-call-my-video-wrapper mb-2">
                        <video ref={myVideoRef} className="video-call-my-video" autoPlay muted />
                    </div>
                    <div className="video-call-their-video-wrapper flex-1">
                        {calling ?
                            <div className="video-call-info">Calling {initiateVideoCall?.to?.name}...</div> :
                            <video ref={theirVideoRef} className="video-call-their-video" autoPlay />
                        }
                    </div>
                </div>
            </div>

            <div className="video-call-footer">
                <div className="display-horizontal">
                    <div className="ml-auto mr-auto">
                        {calling && <button className="button-danger" onClick={endCall}>
                            <VideoOff color="var(--tc-pri)" className="mx-2" />
                        </button>
                        }
                        {callAccepted && <button className="button-danger" onClick={endCall}>
                            <VideoOff color="var(--tc-pri)" className="mx-2" />
                        </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

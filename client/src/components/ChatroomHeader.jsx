import { useContext, useEffect, useState } from "react";
import { ActiveUserContext } from "@/components/Chat";
import { CurrentUserContext, WebsocketContext } from "./App";
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data";
import axios from "axios";
import { getReqConfig } from "@/lib/util";
import { Video } from "lucide-react";

export default function ChatroomHeader({ onInitiateCall }) {

    const { currentUser } = useContext(CurrentUserContext);
    const { activeUser } = useContext(ActiveUserContext);
    const { socket } = useContext(WebsocketContext);

    const [status, setStatus] = useState('connecting...');

    useEffect(() => {
        const getUserStatus = async () => {
            try {
                if (activeUser && activeUser.id) {
                    const value = await axios.get(`${API_SERVER_URL}/users/${activeUser.id}/status`, getReqConfig(currentUser.token));
                    setStatus(value.data.status);
                }
            } catch (reason) {
                setStatus('offline');
                console.log(reason);
            }
        }

        socket.on(SOCKET_SERVER_EVENT.CLIENT_TYPING, (data => {
            if (data.fromUserId === activeUser.id) {
                setStatus('is typing...');
                setTimeout(() => setStatus('online'), 5000);
            }
        }));

        socket.on(SOCKET_SERVER_EVENT.CLIENT_CONNECTION, (user => {
            if (user.id === activeUser.id) setStatus('online');
        }));

        socket.on(SOCKET_SERVER_EVENT.CLIENT_DISCONNECTION, (user => {
            if (user.id === activeUser.id) setStatus('offline');
        }));

        getUserStatus();
        return () => {
            socket.off(SOCKET_SERVER_EVENT.CLIENT_TYPING);
            socket.off(SOCKET_SERVER_EVENT.CLIENT_CONNECTION);
            socket.off(SOCKET_SERVER_EVENT.CLIENT_DISCONNECTION);
        };
    }, [activeUser]);

    const initiateCall = () => {
        if (onInitiateCall && currentUser && activeUser) {
            onInitiateCall({
                fromUser: {
                    id: currentUser.id,
                    email: currentUser.email,
                    name: currentUser.name,
                },
                toUser: { ...activeUser },
            });
        }
    }

    return (
        <div className="chatroom-header">
            <div className="display-horizontal">
                <div className="flex-1">
                    <div className="contact-title">{activeUser.name}</div>
                    <div className="contact-subtitle">{status}</div>
                </div>
                {onInitiateCall && <button onClick={initiateCall}>
                    <Video color="var(--tc-pri)" />
                </button>
                }
            </div>
        </div>
    );
}

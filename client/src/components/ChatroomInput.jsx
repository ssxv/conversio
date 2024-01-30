import { useContext, useState } from "react";
import { CurrentUserContext, WebsocketContext } from "./App";
import { ActiveUserContext } from "@/components/Chat";
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data";
import axios from "axios";
import { SendHorizonal } from "lucide-react";
import { getReqConfig } from "@/lib/util";

export default function ChatroomInput({ onMessage, onSuccess, onError }) {

    const { currentUser } = useContext(CurrentUserContext);
    const { activeUser } = useContext(ActiveUserContext);
    const { socket } = useContext(WebsocketContext);

    const [error, setError] = useState(false);

    const prepareTempMessage = (message) => {
        const clientId = crypto.randomUUID();
        return {
            from: currentUser.id,
            to: activeUser.id,
            message,
            read: false,
            createdAt: new Date().toJSON(),
            modifiedAt: new Date().toJSON(),
            id: clientId,
            clientId
        };
    };

    const sendMessage = async (tempMessage) => {
        try {
            const { clientId, message } = tempMessage;
            const value = await axios.post(`${API_SERVER_URL}/messages`, {
                fromUserId: currentUser.id, toUserId: activeUser.id, clientId, message,
            }, getReqConfig(currentUser.token));

            onSuccess(value.data);
            document.getElementById("new-message-form").reset();
        } catch (reason) {
            console.log(reason);
            setError(true);
            setTimeout(() => setError(false), 5000);

            onError(tempMessage);
        }
    }

    const sendMessageAction = async (formData) => {
        const { message } = Object.fromEntries(formData);
        if (!message) return;

        const tempMessage = prepareTempMessage(message);
        setError(false);
        onMessage(tempMessage);
        sendMessage(tempMessage);
    }

    const sendClientTyping = () => {
        socket.emit(SOCKET_SERVER_EVENT.CLIENT_TYPING, {
            fromUserId: currentUser.id,
            toUserId: activeUser.id,
        });
    }

    return (
        <div className="chatroom-footer">
            {error && (<div className="chat-input-error">Couldn't send this message now. Try again in sometime.</div>)}
            <form id="new-message-form" action={sendMessageAction} className="display-horizontal">
                <div className="flex-1">
                    <input className="w-full" onInput={sendClientTyping} type="text" autoComplete="off" autoFocus placeholder="Type a message" name="message" />
                </div>
                <button className="ml-3" type="submit">
                    <SendHorizonal color="var(--tc-pri)" />
                </button>
            </form>
        </div>
    );
}

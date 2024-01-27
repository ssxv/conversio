import { ActiveUserContext } from "@/app/chat/page";
import { CurrentUserContext, WebsocketContext } from "./App";
import { useContext, useEffect, useState } from "react";
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data"
import { MESSAGE_STORE } from "@/lib/messageStore"
import axios from "axios";
import ChatroomMessages from "./ChatroomMessages";
import ChatroomInput from "./ChatroomInput";
import { prepareReqConfig } from "@/lib/util";

export default function ChatroomBody() {

    // All hooks at the begining of the components
    const { currentUser } = useContext(CurrentUserContext);
    const { activeUser } = useContext(ActiveUserContext);
    const { socket } = useContext(WebsocketContext);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // when activeUser changes
    useEffect(() => {
        const hasRecentMessages = () => true;

        const fetchMessagesForUser = async () => {
            try {
                if (activeUser && activeUser.id) {
                    setLoading(true);
                    const value = await axios.get(`${API_SERVER_URL}/messages?withUserId=${activeUser.id}`, prepareReqConfig(currentUser.token));
                    setLoading(false);
                    const recentMessages = value.data;
                    if (hasRecentMessages(recentMessages)) {
                        const { messages } = MESSAGE_STORE.addMessages(activeUser.id, recentMessages.reverse());
                        setMessages(messages);
                    }
                }
            } catch (reason) {
                setLoading(false);
                console.log(reason);
            }
        }

        fetchMessagesForUser().then(() => {
            // mark message as read
            axios.post(`${API_SERVER_URL}/messages/read`, { fromUserId: activeUser.id }, prepareReqConfig(currentUser.token));
        });

    }, [activeUser]);  // List of reactive dependencies, changes in which cause the useEffect to run

    useEffect(() => {
        if (socket && activeUser) {
            console.log("NEW_MESSAGE listener ON");
            socket.on(SOCKET_SERVER_EVENT.NEW_MESSAGE, newMessageEventHandler);
            console.log("MESSAGE_READ listener ON");
            socket.on(SOCKET_SERVER_EVENT.MESSAGE_READ, messageReadEventHandler);
        }
        return () => {
            if (socket) {
                console.log("NEW_MESSAGE listener OFF");
                socket.off(SOCKET_SERVER_EVENT.NEW_MESSAGE);
                console.log("MESSAGE_READ listener OFF");
                socket.off(SOCKET_SERVER_EVENT.MESSAGE_READ);
            }
        };
    }, [messages]);

    // used by the reciever of the message to add newMessage to message list
    const newMessageEventHandler = (newMessage) => {
        const { from } = newMessage;
        if (from === activeUser.id) {
            const { messages } = MESSAGE_STORE.addMessage(from, newMessage);
            setMessages(messages);

            // mark message as read
            axios.post(`${API_SERVER_URL}/messages/read`, { fromUserId: from }, prepareReqConfig(currentUser.token));
        }
    }

    // used by the sender of the message to mark message as read
    const messageReadEventHandler = (data) => {
        const { toUserId } = data;
        if (toUserId === activeUser.id) {
            const { messages } = MESSAGE_STORE.markRead(toUserId);
            setMessages(messages);
        }
    };

    // used by the sender of the message to add new message to its message list
    const newMessageHandler = (newMessage) => {
        const { messages } = MESSAGE_STORE.addMessage(newMessage.to, newMessage);
        setMessages(messages);
    }

    const newMessageSuccessHandler = (message) => {
        const { messages } = MESSAGE_STORE.markSuccess(message.to, message);
        setMessages(messages);
    }

    const newMessageErrorHandler = (message) => {
        const { messages } = MESSAGE_STORE.markError(message.to, message);
        setMessages(messages);
    }

    return (
        <>
            <ChatroomMessages messages={messages} loading={loading} />
            <ChatroomInput onMessage={newMessageHandler}
                onSuccess={newMessageSuccessHandler}
                onError={newMessageErrorHandler}
            />
        </>
    );
}

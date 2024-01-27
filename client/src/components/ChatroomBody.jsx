import { ActiveUserContext } from "@/app/chat/page";
import { CurrentUserContext, WebsocketContext } from "./App";
import { useContext, useEffect, useState } from "react";
import { API_SERVER_URL, SOCKET_SERVER_EVENT, MESSAGE_STORE } from "@/lib/data";
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
                        const messages = recentMessages.reverse();
                        setMessages(messages);
                        MESSAGE_STORE[activeUser.id] = messages;
                    }
                }
            } catch (reason) {
                setLoading(false);
                console.log(reason);
            }
        }

        fetchMessagesForUser();
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

            const oldMessages = MESSAGE_STORE[from];
            const newMessages = (oldMessages && oldMessages.length) ?
                [...oldMessages, newMessage] : [newMessage];
            setMessages(newMessages);
            MESSAGE_STORE[from] = newMessages;

            // mark message as read
            axios.post(`${API_SERVER_URL}/messages/read`, { fromUserId: from }, prepareReqConfig(currentUser.token));
        }
    }

    // used by the sender of the message to mark message as read
    const messageReadEventHandler = (data) => {
        const { fromUserId, toUserId } = data;
        if (toUserId === activeUser.id) {
            const oldMessages = MESSAGE_STORE[toUserId];
            const newMessages = oldMessages && oldMessages.length && oldMessages.map((message) => {
                if (message.from === fromUserId) {
                    message.read = true;
                }
                return message;
            });
            setMessages(newMessages);
            MESSAGE_STORE[toUserId] = newMessages;
        }
    };

    const newMessageHandler = (newMessage) => {
        // used by the sender of the message to add new message to its message list
        const oldMessages = MESSAGE_STORE[newMessage.to];
        const newMessages = (oldMessages && oldMessages.length) ?
            [...oldMessages, newMessage] : [newMessage];
        setMessages(newMessages);
        MESSAGE_STORE[newMessage.to] = newMessages;
    }

    const newMessageSuccessHandler = (message) => {
        const oldMessages = MESSAGE_STORE[message.to];
        const newMessages = oldMessages && oldMessages.length && oldMessages.map((oldMessage) => {
            if (oldMessage.clientId && oldMessage.clientId === message.clientId) {
                delete oldMessage.error;
            }
            return oldMessage;
        });
        setMessages(newMessages);
        MESSAGE_STORE[message.to] = newMessages;
    }

    const newMessageErrorHandler = (message) => {
        const oldMessages = MESSAGE_STORE[message.to];
        const newMessages = oldMessages && oldMessages.length && oldMessages.map((oldMessage) => {
            if (oldMessage.clientId && oldMessage.clientId === message.clientId) {
                oldMessage.error = true;
            }
            return oldMessage;
        });
        setMessages(newMessages);
        MESSAGE_STORE[message.to] = newMessages;
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

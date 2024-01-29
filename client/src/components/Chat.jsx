"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Users from "@/components/Users"
import { CurrentUserContext, WebsocketContext } from "@/components/App"
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data"
import axios from "axios"
import { getReqConfig, toQueryParams } from "@/lib/util"
import Search from "@/components/Search"
import Navbar from "@/components/Navbar"
import { MESSAGE_STORE } from "@/lib/messageStore"
import ChatroomHeader from "./ChatroomHeader"
import ChatroomMessages from "./ChatroomMessages"
import ChatroomInput from "./ChatroomInput"
import { useRouter } from "next/navigation"

export const ActiveUserContext = createContext(null);

export default function Chat() {

    const router = useRouter();

    const { currentUser } = useContext(CurrentUserContext);
    const { socket } = useContext(WebsocketContext);

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState({});
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [searchResult, setSearchResult] = useState(null);

    // get recent users
    useEffect(() => {
        const currentUserFromLocal = currentUser || JSON.parse(localStorage.getItem('user'));
        if (!currentUserFromLocal) {
            router.push('/');
            return;
        }
        getUsers();
    }, [currentUser]);

    useEffect(() => {
        users && users.length && !(activeUser && activeUser.id) && updateActiveUser(users[0]);
    }, [users]);

    useEffect(() => {
        if (socket && users && users.length) {
            socket.on(SOCKET_SERVER_EVENT.NEW_MESSAGE, incomingMessageEventHandler);
            socket.on(SOCKET_SERVER_EVENT.MESSAGE_READ, messageReadEventHandler);
            console.log("NEW_MESSAGE, MESSAGE_READ listener ON");
        }
        return () => {
            if (socket) {
                socket.off(SOCKET_SERVER_EVENT.NEW_MESSAGE);
                socket.off(SOCKET_SERVER_EVENT.MESSAGE_READ);
                console.log("NEW_MESSAGE, MESSAGE_READ listener OFF");
            }
        };
    });

    const getUsers = async () => {
        if (!currentUser || !currentUser.token) return;
        try {
            setLoadingUsers(true);
            const value = await axios.get(`${API_SERVER_URL}/users/recent`, getReqConfig(currentUser.token));
            setLoadingUsers(false);
            value.data && value.data.length && setUsers(value.data);
        } catch (reason) {
            setLoadingUsers(false);
            console.log(reason);
        }
    }

    const fetchRecentConversation = async (user) => {
        const query = { conversationWithUserId: user.id };
        const lastMessage = MESSAGE_STORE.getLastMessage(user.id);
        if (lastMessage && lastMessage.createdAt) {
            const lastMessageDate = new Date(new Date(lastMessage.createdAt).getTime() + 1);
            query.fromDate = lastMessageDate.toJSON();
        }
        try {
            setMessagesLoading(true);
            const value = await axios.get(`${API_SERVER_URL}/messages${toQueryParams(query)}`, getReqConfig(currentUser.token));
            setMessagesLoading(false);

            if (value.data && value.data.length) {
                await markMessagesRead(user.id, value.data.reverse());
                setUsers([...users]);
                setMessages(MESSAGE_STORE.getMessages(user.id));
            }
        } catch (reason) {
            setMessagesLoading(false);
            console.log(reason);
        }
    }

    const updateActiveUser = async (user) => {
        const lastMessage = MESSAGE_STORE.getLastMessage(user.id);
        if (lastMessage && lastMessage.from === user.id && !lastMessage.read) {
            await markMessagesRead(user.id, MESSAGE_STORE.getMessages(user.id));
        }
        const updatedUsers = users.find(u => u.id === user.id) ? [...users] : [user, ...users];
        setUsers(updatedUsers);
        setSearchResult(undefined);
        setActiveUser(user);
        setMessages(MESSAGE_STORE.getMessages(user.id));
        fetchRecentConversation(user);
    }

    const markMessagesRead = async (senderUserId, messages) => {
        await axios.post(`${API_SERVER_URL}/messages/read`, { senderUserId }, getReqConfig(currentUser.token));
        const newMessages = messages.map((message) => {
            if (message.from === senderUserId) message.read = true;
            return message;
        });
        MESSAGE_STORE.addMessages(senderUserId, newMessages)
    }

    // used by the reciever of the message to add newMessage to message list
    const incomingMessageEventHandler = async (newMessage) => {
        const { from: userId } = newMessage;
        if (activeUser && activeUser.id === userId) {
            await axios.post(`${API_SERVER_URL}/messages/read`, { senderUserId: userId }, getReqConfig(currentUser.token));
            newMessage.read = true;
            setMessages(MESSAGE_STORE.addMessage(userId, newMessage).messages);
        } else {
            MESSAGE_STORE.addMessage(userId, newMessage);
        }
        setUsers([...users]);
    }

    // used by the sender of the message to mark message as read
    const messageReadEventHandler = ({ receiverUserId }) => {
        setUsers([...users]);
        setMessages(MESSAGE_STORE.markRead(receiverUserId).messages);
    };

    const sentMessageHandler = (newMessage) => {
        setUsers([...users]);
        setMessages(MESSAGE_STORE.addMessage(newMessage.to, newMessage).messages);
    }

    const sentMessageSuccessHandler = (message) => {
        setMessages(MESSAGE_STORE.markSuccess(message.to, message).messages);
    }

    const sentMessageErrorHandler = (message) => {
        setMessages(MESSAGE_STORE.markSuccess(message.to, message).messages);
    }

    if (!currentUser) return null;

    return (
        <ActiveUserContext.Provider value={{ activeUser }}>
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <Navbar />
                    <Search
                        onSearchResult={users => users && users.length && setSearchResult(users)}
                        onClose={() => setSearchResult(null)}
                        close={searchResult === undefined}
                    />
                </div>
                <div className="chat-sidebar-body">
                    {searchResult && searchResult.length > 0 && <>
                        <div className="recent-users-loading-info">Search results</div>
                        <Users users={searchResult} userSelectionHandler={updateActiveUser} />
                    </>
                    }
                    {!(searchResult && searchResult.length > 0) && loadingUsers && <div className="recent-users-loading-info">loading conversations...</div>}
                    {!(searchResult && searchResult.length > 0) && users && users.length > 0 && <Users users={users} userSelectionHandler={updateActiveUser} />}
                    {!(searchResult && searchResult.length > 0) && !loadingUsers && !(users && users.length > 0) && <div className="recent-users-loading-info">You haven't started a conversation with anyone. Start a conversation by searching for users by their name or email.</div>}
                </div>
            </div>

            {activeUser && activeUser.id && (
                <div className="chatroom">
                    <ChatroomHeader />
                    <ChatroomMessages messages={messages} loading={messagesLoading} />
                    <ChatroomInput
                        onMessage={sentMessageHandler}
                        onSuccess={sentMessageSuccessHandler}
                        onError={sentMessageErrorHandler}
                    />
                </div>
            )}
        </ActiveUserContext.Provider>
    );
}
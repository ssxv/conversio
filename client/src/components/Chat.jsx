"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { CurrentUserContext, WebsocketContext } from "@/components/App"
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data"
import axios from "axios"
import { getReqConfig, defaultNotificationOptions, toQueryParams } from "@/lib/util"
import Search from "@/components/Search"
import Navbar from "@/components/Navbar"
import { MESSAGE_STORE } from "@/lib/messageStore"
import ChatroomHeader from "./ChatroomHeader"
import ChatroomMessages from "./ChatroomMessages"
import ChatroomInput from "./ChatroomInput"
import ChatSidebar from "./ChatSidebar"
import { Store } from "react-notifications-component"
import VideoCall from "./VideoCall"
import VideoCallNotificationIncomingCall from "./VideoCallNotificationIncomingCall"
import VideoCallNotificationCallDeclined from "./VideoCallNotificationCallDeclined"
import VideoCallNotificationCallEnded from "./VideoCallNotificationCallEnded"

export const ActiveUserContext = createContext(null);

export default function Chat() {

    const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
    const { socket } = useContext(WebsocketContext);

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState({});
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [searchResult, setSearchResult] = useState(null);

    const [initiateVideoCall, setInitiateVideoCall] = useState(null);
    const [answerVideoCall, setAnswerVideoCall] = useState(null);
    const [notificationId, setNotificationId] = useState(null);

    // get recent users
    useEffect(() => {
        isLoggedIn() && getUsers();
    }, [currentUser]);

    useEffect(() => {
        users && users.length && !(activeUser && activeUser.id) && updateActiveUser(users[0]);
    }, [users]);

    useEffect(() => {
        if (socket && users && users.length) {
            socket.on(SOCKET_SERVER_EVENT.NEW_MESSAGE, incomingMessageEventHandler);
            socket.on(SOCKET_SERVER_EVENT.MESSAGE_READ, messageReadEventHandler);
            socket.on(SOCKET_SERVER_EVENT.CALL_REQUEST, incomingCallRequestEventHandler);
            socket.on(SOCKET_SERVER_EVENT.CALL_DECLINED, callDeclinedEventHandler);
            socket.on(SOCKET_SERVER_EVENT.CALL_ENDED, callEndedEventHandler);
        }
        return () => {
            if (socket) {
                socket.off(SOCKET_SERVER_EVENT.NEW_MESSAGE);
                socket.off(SOCKET_SERVER_EVENT.MESSAGE_READ);
                socket.off(SOCKET_SERVER_EVENT.CALL_REQUEST);
                socket.off(SOCKET_SERVER_EVENT.CALL_DECLINED);
                socket.off(SOCKET_SERVER_EVENT.CALL_ENDED);
            }
        };
    });

    const getUsers = async () => {
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
            setMessages(MESSAGE_STORE.addMessage(userId, newMessage));
        } else {
            MESSAGE_STORE.addMessage(userId, newMessage);
        }
        setUsers([...users]);
    }

    // used by the sender of the message to mark message as read
    const messageReadEventHandler = ({ receiverUserId }) => {
        setUsers([...users]);
        setMessages(MESSAGE_STORE.markRead(receiverUserId));
    };

    const incomingCallRequestEventHandler = ({ from, signalData }) => {

        const notificationId = crypto.randomUUID();

        const onAnswer = () => {
            Store.removeNotification(notificationId);
            setAnswerVideoCall({
                from,
                signalData
            });
        }

        const onDecline = () => {
            Store.removeNotification(notificationId);
            socket.emit(SOCKET_SERVER_EVENT.CALL_DECLINED, {
                fromUserId: from.id,
                by: {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                }
            });
        }

        const a =
            Store.addNotification({
                ...defaultNotificationOptions,
                id: notificationId,
                content: <VideoCallNotificationIncomingCall name={from.name} onAnswer={onAnswer} onDecline={onDecline} />,
            });
        setNotificationId(notificationId);
    }

    const callDeclinedEventHandler = ({ by }) => {
        Store.addNotification({
            ...defaultNotificationOptions,
            content: <VideoCallNotificationCallDeclined name={by.name} />,
            dismiss: {
                duration: 10000
            }
        });
        closeVideoCallHandler();
    }

    const callEndedEventHandler = ({ by }) => {
        Store.removeNotification(notificationId);
        Store.addNotification({
            ...defaultNotificationOptions,
            content: <VideoCallNotificationCallEnded name={by.name} />,
            dismiss: {
                duration: 10000
            }
        });
        setNotificationId(null);
        closeVideoCallHandler();
    }

    const initiateVideoCallHandler = (data) => {
        setInitiateVideoCall(data);
    }

    const closeVideoCallHandler = () => {
        setInitiateVideoCall(null);
        setAnswerVideoCall(null);
    }

    const sentMessageHandler = (newMessage) => {
        setUsers([...users]);
        setMessages(MESSAGE_STORE.addMessage(newMessage.to, newMessage));
    }

    const sentMessageSuccessHandler = (message) => {
        setMessages(MESSAGE_STORE.markSuccess(message.to, message));
    }

    const sentMessageErrorHandler = (message) => {
        setMessages(MESSAGE_STORE.markError(message.to, message));
    }

    if (!isLoggedIn()) return null;

    return (
        <>
            <div className={initiateVideoCall || answerVideoCall ? 'video-call-body video-call-front' : 'video-call-body video-call-back'}>
                <VideoCall initiateVideoCall={initiateVideoCall} answerVideoCall={answerVideoCall} onClose={closeVideoCallHandler} />
            </div>

            <div className="chat-body">
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
                            <ChatSidebar searchResult={searchResult} loadingUsers={loadingUsers} users={users} onUserSelection={updateActiveUser} />
                        </div>
                    </div>

                    {activeUser && activeUser.id && (
                        <div className="chatroom">
                            <ChatroomHeader onInitiateVideoCall={initiateVideoCallHandler} />
                            <ChatroomMessages messages={messages} loading={messagesLoading} />
                            <ChatroomInput
                                onMessage={sentMessageHandler}
                                onSuccess={sentMessageSuccessHandler}
                                onError={sentMessageErrorHandler}
                            />
                        </div>
                    )}
                </ActiveUserContext.Provider>
            </div>
        </>

    );
}
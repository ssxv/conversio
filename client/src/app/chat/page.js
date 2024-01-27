"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Chatroom from "@/components/Chatroom"
import Users from "@/components/Users"
import { CurrentUserContext, WebsocketContext } from "@/components/App"
import { API_SERVER_URL, SOCKET_SERVER_EVENT } from "@/lib/data"
import axios from "axios"
import { prepareReqConfig } from "@/lib/util"
import Search from "@/components/Search"
import Navbar from "@/components/Navbar"

export const ActiveUserContext = createContext(null);

export default function ChatPage() {

    const { currentUser, logout } = useContext(CurrentUserContext);
    const { socket } = useContext(WebsocketContext);

    const [activeUser, setActiveUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [recentUsers, setRecentUsers] = useState([]);
    const [searchResult, setSearchResult] = useState(null);

    // get recent users
    useEffect(() => {
        getUsers();
    }, [currentUser]);

    // set NEW_MESSAGE_FOR_NOTIFICATION listener
    useEffect(() => {
        if (socket && activeUser && recentUsers && recentUsers.length) {
            console.log('NEW_MESSAGE_FOR_NOTIFICATION listener ON');
            socket.on(SOCKET_SERVER_EVENT.NEW_MESSAGE_FOR_NOTIFICATION, (message => {
                const updatedRecentUsers = recentUsers.map(user => {
                    if (user.id === message.from && user.id !== activeUser.id) {
                        user.newMessage = message;
                    }
                    return user;
                });
                setRecentUsers(updatedRecentUsers);
            }));
        }
        return () => {
            if (socket) {
                console.log('NEW_MESSAGE_FOR_NOTIFICATION listener OFF');
                socket.off(SOCKET_SERVER_EVENT.NEW_MESSAGE_FOR_NOTIFICATION);
            }
        }
    }, [socket, activeUser]);

    const getUsers = async () => {
        if (!currentUser || !currentUser.token) {
            return;
        }
        try {
            setLoading(true);
            const value = await axios.get(`${API_SERVER_URL}/users/recent`, prepareReqConfig(currentUser.token));
            setLoading(false);
            const users = value.data;
            setRecentUsers([...users]);
            setActiveUser(users[0]);
        } catch (reason) {
            setLoading(false);
            console.log(reason);
        }
    }

    const updateActiveUser = (user) => {
        if (user.newMessage && user.newMessage.id) {
            delete user.newMessage;
        }
        // mark message as read
        axios.post(`${API_SERVER_URL}/messages/read`, { fromUserId: user.id }, prepareReqConfig(currentUser.token));
        setActiveUser(user);
    }

    const searchResultHandler = (users) => {
        if (!users) {
            getUsers();
        }
        setSearchResult(users);
    }

    if (!currentUser) return null;

    return (
        <div className="chat-body">
            <ActiveUserContext.Provider value={{ activeUser }}>
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <Navbar />
                        <Search searchResult={searchResultHandler} />
                    </div>
                    <div className="chat-sidebar-body">
                        {searchResult && searchResult.length > 0 && <Users users={searchResult} userSelectionHandler={updateActiveUser} />}
                        {!(searchResult && searchResult.length > 0) && loading && (<div className="recent-users-loading-info">loading conversations...</div>)}
                        {!(searchResult && searchResult.length > 0) && recentUsers && recentUsers.length > 0 && <Users users={recentUsers} userSelectionHandler={updateActiveUser} />}
                        {!(searchResult && searchResult.length > 0) && !(recentUsers && recentUsers.length > 0) && <div className="recent-users-loading-info">You haven't started a conversation with anyone. Start a conversation by searching for users by their name or email.</div>}
                    </div>
                </div>

                <Chatroom />
            </ActiveUserContext.Provider>
        </div>
    )
}

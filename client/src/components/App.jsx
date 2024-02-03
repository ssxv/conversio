"use client"

import { SOCKET_SERVER_URL } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
// import 'animate.css/animate.min.css';

export const CurrentUserContext = createContext(null);
export const WebsocketContext = createContext(null);

export default function App({ children }) {

    const router = useRouter();

    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const currentUserFromLocal = JSON.parse(localStorage.getItem('user'));
        setCurrentUserAndCreateSocket(currentUserFromLocal);
    }, []);

    const isLoggedIn = () => {
        return !!(currentUser && currentUser.id && currentUser.token);
    }

    const setCurrentUserAndCreateSocket = (user) => {
        setCurrentUser(user);
        if (user && user.token) {
            const newSocket = io(SOCKET_SERVER_URL, { autoConnect: true, query: { "token": `${user.token}` } });
            setSocket(newSocket);
        }
    }

    const logout = () => {
        setCurrentUser(null);
        socket.disconnect();
        localStorage.setItem('user', null);
        router.push('/');
    }

    return (
        <CurrentUserContext.Provider value={{ currentUser, isLoggedIn, setCurrentUserAndCreateSocket, logout }} >
            <WebsocketContext.Provider value={{ socket }}>
                <ReactNotifications />
                {children}
            </WebsocketContext.Provider>
        </CurrentUserContext.Provider>
    );
}

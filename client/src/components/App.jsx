"use client"
import { SOCKET_SERVER_URL } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const CurrentUserContext = createContext(null);
export const WebsocketContext = createContext(null);

export default function App({ children }) {

    const router = useRouter();

    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);

    const setCurrentUserAndCreateSocket = (user) => {
        setCurrentUser(user);
        if (user && user.token) {
            const newSocket = io(SOCKET_SERVER_URL, { autoConnect: true, query: { "token": `${user.token}` } });
            setSocket(newSocket);
        }
    }

    useEffect(() => {
        const currentUserFromLocal = JSON.parse(localStorage.getItem('user'));
        setCurrentUserAndCreateSocket(currentUserFromLocal);
    }, []);

    const logout = () => {
        setCurrentUser(null);
        socket.disconnect();
        localStorage.setItem('user', null);
        router.push('/');
    }

    return (
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUserAndCreateSocket, logout }} >
            <WebsocketContext.Provider value={{ socket }}>
                {children}
            </WebsocketContext.Provider>
        </CurrentUserContext.Provider>
    );
}

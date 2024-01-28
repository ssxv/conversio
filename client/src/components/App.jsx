"use client"
import { API_SERVER_URL, SOCKET_SERVER_URL } from '@/lib/data';
import { getReqConfig } from '@/lib/util';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// const sock = io();

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

    const login = async (data) => {
        try {
            const value = await axios.post(`${API_SERVER_URL}/auth/login`, data, getReqConfig());
            const user = value.data;
            localStorage.setItem('user', JSON.stringify(user));

            setCurrentUserAndCreateSocket(user);

            router.push('/chat');
        } catch (err) { }
    }

    const logout = () => {

        setCurrentUser(null);
        socket.disconnect();
        localStorage.setItem('user', null);
        router.push('/');
    }

    return (
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser, login, logout }} >
            <WebsocketContext.Provider value={{ socket }}>
                {children}
            </WebsocketContext.Provider>
        </CurrentUserContext.Provider>
    );
}

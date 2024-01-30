export const APP_NAME = 'Conversio';
export const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
export const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
export const SOCKET_SERVER_EVENT = {
    CLIENT_CONNECTION: 'client-connection',
    CLIENT_DISCONNECTION: 'client-disconnection',
    NEW_MESSAGE: 'new-message',
    CLIENT_TYPING: 'client-typing',
    MESSAGE_READ: 'message-read',
};

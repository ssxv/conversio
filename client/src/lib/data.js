export const API_SERVER_URL = 'http://localhost:9000/api';
export const SOCKET_SERVER_URL = 'http://localhost:9000/chat';
export const SOCKET_SERVER_EVENT = {
    CLIENT_CONNECTION: 'client-connection',
    CLIENT_DISCONNECTION: 'client-disconnection',
    NEW_MESSAGE: 'new-message',
    NEW_MESSAGE_FOR_NOTIFICATION: 'new-message-for-notification',
    CLIENT_TYPING: 'client-typing',
    MESSAGE_READ: 'message-read',
};

/**
 * {
 *   userId1: [
 *      { from: userId1, to: userId0 },
 *      { from: userId0, to: userId1 },   
 *   ],
 *   userId2: [
 *      { from: userId2, to: userId0 },
 *      { from: userId0, to: userId2 },   
 *   ],
 * }
 */
export const MESSAGE_STORE = {};

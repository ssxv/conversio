import { CurrentUserContext } from "./App";
import { useContext, useEffect, useRef } from "react";

export default function ChatroomMessages({ messages, loading }) {

    const { currentUser } = useContext(CurrentUserContext);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    const getMessageTime = (message) => {
        const messageDate = new Date(message.createdAt);
        const timeParts = messageDate.toLocaleTimeString().split(':');
        return `${timeParts[0]}:${timeParts[1]} ${timeParts[2].substring(3)}`;
    }

    const getMessageStatus = (message) => {
        if (message.read) {
            return <div className="chat-message-read">Read</div>;
        } else if (message.error) {
            return <div>Failed</div>;
        } else if (message.id !== message.clientId) {
            return <div>Sent</div>;
        }
    }

    if (loading) {
        return (
            <div className="chatroom-body">
                <div className="chatroom-body-info">fetching recent messages...</div>
            </div>
        );
    }

    if (!messages || !messages.length) {
        return (
            <div className="chatroom-body">
                <div className="chatroom-body-info">You haven't had a conversation with this user yet. Send a message to start a conversation.</div>
            </div>
        );
    }

    return (
        <div className="chatroom-body">
            {
                messages.map((message) => {
                    if (message.from === currentUser.id) {
                        return (
                            <div key={message.id} className="chat-message-wrapper">
                                <div className="display-horizontal-top">
                                    <div className="chat-message chat-message-sent">
                                        <div>{message.message}</div>
                                        <div className="chat-message-info">
                                            <div className="pr-2">{getMessageTime(message)}</div>
                                            {getMessageStatus(message)}
                                        </div>
                                    </div>
                                    <div className="triangle-topleft"></div>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={message.id} className="chat-message-wrapper">
                                <div className="display-horizontal-top">
                                    <div className="triangle-topright"></div>
                                    <div className="chat-message chat-message-received">
                                        <div>{message.message}</div>
                                        <div className="chat-message-info">
                                            <div className="chat-message-time">{getMessageTime(message)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })
            }
            <div id="message-end" ref={messagesEndRef} />
        </div>
    );
}

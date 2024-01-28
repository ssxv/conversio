"use client"
import { useContext } from "react";
import { ActiveUserContext } from "@/app/chat/page";

export default function Users({ users, userSelectionHandler }) {

    const { activeUser } = useContext(ActiveUserContext);

    const highlight = (user) => activeUser && activeUser.id !== user.id && user.lastMessage && !user.lastMessage.read;

    return (
        <div className="recent-users">
            {users && users.length > 0 && users.map(user =>
                <div key={user.id} className={`contact-card ${activeUser && activeUser.id === user.id && 'recent-user-active'}`} onClick={() => userSelectionHandler(user)}>
                    <div className="contact-title">{user.name}</div>
                    {user.lastMessage && <p className={`contact-subtitle trim-text ${highlight(user) && 'tc-accent-secondary'}`}>{highlight(user) && '~ '}{user.lastMessage.message}</p>}
                    {!user.lastMessage && <div className="contact-subtitle trim-text">{user.email}</div>}
                </div>
            )}
        </div>
    );
}

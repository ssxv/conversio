"use client"
import { useContext } from "react";
import { ActiveUserContext } from "@/app/chat/page";

export default function Users({ users, userSelectionHandler }) {

    const { activeUser } = useContext(ActiveUserContext);

    return (
        <div className="recent-users">
            {users && users.length > 0 && users.map(user =>
                <div key={user.id} className={activeUser && user.id === activeUser.id ? 'contact-card recent-user-active' : 'contact-card'} onClick={() => userSelectionHandler(user)}>
                    <div className="contact-title">{user.name}</div>
                    {user.lastMessage && user.lastMessage?.id && <p className="contact-subtitle">{user.lastMessage.message}</p>}
                    {user.newMessage && user.newMessage?.id && <p className="contact-subtitle tc-accent-secondary">~ {user.newMessage.message}</p>}
                    {!user.newMessage && !user.lastMessage && <div className="contact-subtitle">{user.email}</div>}
                </div>
            )}
        </div>
    );
}

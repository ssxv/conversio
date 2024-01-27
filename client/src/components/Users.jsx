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
                    {user.lastMessage && <p className={user.lastMessage.read ? "contact-subtitle" : "contact-subtitle tc-accent-secondary"}>{!user.lastMessage.read && '~ '}{user.lastMessage.message}</p>}
                    {!user.lastMessage && <div className="contact-subtitle">{user.email}</div>}
                </div>
            )}
        </div>
    );
}

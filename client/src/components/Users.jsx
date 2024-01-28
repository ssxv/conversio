"use client"
import { useContext } from "react";
import { ActiveUserContext } from "@/components/Chat";
import { MESSAGE_STORE } from "@/lib/messageStore";

export default function Users({ users, userSelectionHandler }) {

    const { activeUser } = useContext(ActiveUserContext);

    return (
        <div className="recent-users">
            {users && users.length > 0 && users.map(user => {
                const lastMessage = MESSAGE_STORE.getLastMessage(user.id) || user.lastMessage;
                let highlight = lastMessage && lastMessage.from === user.id && !lastMessage.read;
                if (activeUser && activeUser.id === user.id) highlight = false;

                return (
                    <div key={user.id} className={`contact-card ${activeUser && activeUser.id === user.id && 'recent-user-active'}`} onClick={() => userSelectionHandler(user)}>
                        <div className="contact-title">{user.name}</div>
                        {lastMessage && <p className={`contact-subtitle trim-text ${highlight && 'tc-accent-secondary'}`}>{highlight && '~ '}{lastMessage.message}</p>}
                        {!lastMessage && <div className="contact-subtitle trim-text">{user.email}</div>}
                    </div>
                );
            })
            }
        </div>
    );
}

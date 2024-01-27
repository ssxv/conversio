import ChatroomHeader from "@/components/ChatroomHeader";
import { ActiveUserContext } from "@/app/chat/page";
import { useContext } from "react";
import ChatroomBody from "./ChatroomBody";

export default function Chatroom() {

    const { activeUser } = useContext(ActiveUserContext);

    // All the JSX returns towards the end of the component
    if (!activeUser || !activeUser.id) return null;

    return (
        <div className="chatroom">
            <ChatroomHeader />
            <ChatroomBody />
        </div>
    );
}

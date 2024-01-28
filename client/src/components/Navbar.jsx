import { LogOut, UserCircle2 } from "lucide-react";
import { useContext } from "react";
import { CurrentUserContext } from "./App";

export default function Navbar() {

    const { currentUser, logout } = useContext(CurrentUserContext);

    return (
        <div className="p-1">
            <div className="display-horizontal">
                <UserCircle2 className="mx-1" color="var(--tc-pri)" />
                <div className="contact-name trim-text flex-1 mx-1">{currentUser.name}</div>
                <button onClick={logout}>
                    <LogOut color="var(--tc-pri)" />
                </button>
            </div>
        </div>
    );
}

"use client"

import { CurrentUserContext } from "@/components/App";
import Chat from "@/components/Chat";
import Home from "@/components/Home";
import { useContext } from "react";

export default function HomePage() {

    const { isLoggedIn } = useContext(CurrentUserContext);

    return (
        <div className="container">
            {isLoggedIn() ? <Chat /> : <Home />}
        </div>
    )
}

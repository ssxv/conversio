"use client"

import { CurrentUserContext } from "@/components/App";
import { APP_NAME } from "@/lib/data";
import { useContext } from "react";

export default function Loading() {

    const { isLoggedIn } = useContext(CurrentUserContext);

    return (
        <div className="container">
            <div className="display-vertical-center">
                <div className="app-name">{APP_NAME}</div>
                <div className="m-2">{isLoggedIn() ? 'Preparing your chat window...' : 'Loading...'}</div>
            </div>
        </div>
    );
}

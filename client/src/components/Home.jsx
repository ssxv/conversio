"use client"
import SignIn from "@/components/SignIn";
import { APP_NAME } from "@/lib/data";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { CurrentUserContext } from "./App";
import { useRouter } from "next/navigation";

export default function Home() {

    const { currentUser } = useContext(CurrentUserContext);
    const router = useRouter();

    useEffect(() => {
        const currentUserFromLocal = currentUser || JSON.parse(localStorage.getItem('user'));
        currentUserFromLocal && router.push('/chat');
    }, [currentUser]);

    return (
        <div className="display-vertical-center">
            <div className="app-name">{APP_NAME}</div>
            <div className="mb-3">
                <SignIn />
            </div>
            <div className="mb-3">Or</div>
            <div className="">
                <Link href="/signup">Sign up to create a new account</Link>
            </div>
        </div>
    )
}

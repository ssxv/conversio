"use client"
import { API_SERVER_URL } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { CurrentUserContext } from "./App";
import axios from "axios";
import { prepareReqConfig } from "@/lib/util";

export default function Signup() {

    const { setCurrentUser } = useContext(CurrentUserContext);
    const router = useRouter();

    const signUpAction = async (formData) => {
        const { name, email, password, passwordConfirmation } = Object.fromEntries(formData);

        if (password !== passwordConfirmation) return 'Password mismatch';

        try {
            const value = await axios.post(`${API_SERVER_URL}/auth/sign-up`, {
                name, email, password, passwordConfirmation,
            }, prepareReqConfig());
            const user = value.data;
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            router.push('/chat');
        } catch (err) { }
    }

    return (
        <form action={signUpAction}>
            <div>
                <input type="text" placeholder="Full name" name="name" required />
            </div>
            <br />
            <div>
                <input type="email" placeholder="Email" name="email" required />
            </div>
            <br />
            <div>
                <input type="password" placeholder="Password" name="password" required />
            </div>
            <br />
            <div>
                <input type="password" placeholder="Confirm Password" name="passwordConfirmation" required />
            </div>
            <br />
            <div className="display-horizontal">
                <button className="button-primary" type="submit">Sign-up</button>
                <Link className="button-primary ml-3" href="/">Cancel</Link>
            </div>
        </form>
    );
}

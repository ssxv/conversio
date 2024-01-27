"use client"
import { useContext } from "react";
import { CurrentUserContext } from "./App";
import { LogIn } from "lucide-react";

export default function Login() {

    const { login } = useContext(CurrentUserContext);

    const loginAction = (formData) => login(Object.fromEntries(formData));

    return (
        <form action={loginAction} className="display-horizontal">
            <div>
                <input type="email" placeholder="Email" name="email" required />
            </div>
            <div className="ml-2">
                <input type="password" placeholder="Password" name="password" required />
            </div>
            <button className="button-primary ml-2" type="submit"><LogIn color="var(--tc-pri)"/></button>
        </form>
    );
}

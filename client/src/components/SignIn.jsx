"use client"
import { useContext, useState } from "react";
import { CurrentUserContext } from "./App";
import { LogIn } from "lucide-react";
import axios from "axios";
import { API_SERVER_URL } from "@/lib/data";
import { getReqConfig } from "@/lib/util";
import { useRouter } from "next/navigation";
import { TailSpin } from "react-loader-spinner";

export default function SignIn() {

    const { setCurrentUserAndCreateSocket } = useContext(CurrentUserContext);
    const [signingIn, setSigningIn] = useState(false);
    const router = useRouter();

    const callLoginApi = async (formData) => {
        try {
            const data = Object.fromEntries(formData);
            const value = await axios.post(`${API_SERVER_URL}/auth/login`, data, getReqConfig());
            const user = value.data;
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUserAndCreateSocket(user);
            router.push('/chat');
        } catch (reason) {
            console.log(reason);
            setSigningIn(false);
        }
    }

    const loginAction = (formData) => {
        setSigningIn(true);
        callLoginApi(formData);
    }

    return (
        <form action={loginAction} className="display-horizontal">
            <div>
                <input disabled={signingIn} type="email" placeholder="Email" name="email" required />
            </div>
            <div className="ml-2">
                <input disabled={signingIn} type="password" placeholder="Password" name="password" required />
            </div>
            <button disabled={signingIn} className="button-primary ml-2" type="submit">
                {signingIn ?
                    <TailSpin
                        height="1.5em"
                        width="1.5em"
                        color="var(--tc-pri)"
                        radius="2"
                        wrapperClass="mx-2"
                    /> :
                    <LogIn color="var(--tc-pri)" className="mx-2" />
                }
            </button>
        </form>
    );
}

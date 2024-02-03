"use client"

import { API_SERVER_URL } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { CurrentUserContext } from "./App";
import axios from "axios";
import { getReqConfig } from "@/lib/util";
import { TailSpin } from "react-loader-spinner";

export default function SignUp() {

    const { setCurrentUserAndCreateSocket } = useContext(CurrentUserContext);
    const [signingUp, setSigningUp] = useState(false);
    const router = useRouter();

    const callSignUpApi = async (formData) => {
        try {
            const data = Object.fromEntries(formData);
            const value = await axios.post(`${API_SERVER_URL}/auth/sign-up`, data, getReqConfig());
            const user = value.data;
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUserAndCreateSocket(user);
            router.push('/');
        } catch (reason) {
            setSigningUp(false);
            console.log(reason);
        }
    }

    const signUpAction = (formData) => {
        const { password, passwordConfirmation } = Object.fromEntries(formData);
        if (password !== passwordConfirmation) return 'Password mismatch';

        setSigningUp(true);
        callSignUpApi(formData);
    }

    return (
        <form action={signUpAction}>
            <div>
                <input disabled={signingUp} type="text" placeholder="Full name" name="name" required />
            </div>
            <br />
            <div>
                <input disabled={signingUp} type="email" placeholder="Email" name="email" required />
            </div>
            <br />
            <div>
                <input disabled={signingUp} type="password" placeholder="Password" name="password" required />
            </div>
            <br />
            <div>
                <input disabled={signingUp} type="password" placeholder="Confirm Password" name="passwordConfirmation" required />
            </div>
            <br />
            <div className="display-horizontal">
                <button disabled={signingUp} className="button-primary" type="submit">
                    {signingUp ?
                        <TailSpin
                            height="1.5em"
                            width="1.5em"
                            color="var(--tc-pri)"
                            radius="2"
                            wrapperClass="mx-2"
                        /> :
                        'Sign-up'
                    }
                </button>
                <Link className="button-primary ml-3" href="/">Cancel</Link>
            </div>
        </form>
    );
}

import SignIn from "@/components/SignIn";
import { APP_NAME } from "@/lib/data";
import Link from "next/link";

export default function Home() {
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

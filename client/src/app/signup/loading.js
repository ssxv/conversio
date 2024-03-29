import { APP_NAME } from "@/lib/data";

export default function Loading() {
    return (
        <div className="container">
            <div className="display-vertical-center">
                <div className="app-name">{APP_NAME}</div>
                <div className="m-2">Sign-up page coming right up...</div>
            </div>
        </div>
    );
}

import { VideoIcon, VideoOff } from "lucide-react";

export default function VideoCallNotificationIncomingCall({ name, onAnswer, onDecline }) {

    return (
        <div className="notification">
            <div className="notification-content">
                <div className="display-horizontal">
                    <div className="flex-1 mr-2">
                        <div className="contact-title">{name}</div>
                        <div className="contact-subtitle">is calling...</div>
                    </div>
                    <button className="button-primary mr-2" onClick={onAnswer}>
                        <VideoIcon color="var(--tc-pri)" className="mx-2" />
                    </button>
                    <button className="button-danger" onClick={onDecline}>
                        <VideoOff color="var(--tc-pri)" className="mx-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
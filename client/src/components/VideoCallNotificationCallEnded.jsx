export default function VideoCallNotificationCallEnded({ name }) {

    return (
        <div className="notification">
            <div className="contact-title">{name}</div>
            <div className="contact-subtitle">call ended</div>
        </div>
    );
}
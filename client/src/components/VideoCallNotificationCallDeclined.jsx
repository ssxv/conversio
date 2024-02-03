export default function VideoCallNotificationCallDeclined({ name }) {

    return (
        <div className="notification">
            <div className="contact-title">{name}</div>
            <div className="contact-subtitle">call declined</div>
        </div>
    );
}
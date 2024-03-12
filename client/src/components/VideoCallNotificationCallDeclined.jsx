export default function VideoCallNotificationCallDeclined({ name }) {

    return (
        <div className="notification">
            <div className="notification-content">
                <div className="contact-title">{name}</div>
                <div className="contact-subtitle">has declined your call</div>
            </div>
        </div>
    );
}